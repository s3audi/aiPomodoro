import type { WorkPackage, Worker, Task, SubTask, WorkPackageTemplate, TaskTemplate } from '../types';
import { TaskStatus } from '../types';

// Adım 3'te oluşturduğunuz Personal Access Token'ı buraya yapıştırın.
const AIRTABLE_API_KEY = 'patY2yGLrAfh96M1s.f412990b6f78681ed7672e83e61da73c36b6ae34ca5c0c7cb908f871c4b089b8';
// Adım 4'te bulduğunuz Base ID'yi buraya yapıştırın.
const AIRTABLE_BASE_ID = 'appgMyZNvnJMRCqT1';
// Adım 2'de oluşturduğunuz veya belirlediğiniz tablonun adını buraya yazın.
const AIRTABLE_TABLE_NAME = 'Pomodoro';
const AIRTABLE_TEMPLATE_TABLE_NAME = 'PomoSablon';

const API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
const TEMPLATE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TEMPLATE_TABLE_NAME)}`;


const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

const statusMap: { [key in TaskStatus]: string } = {
  [TaskStatus.Pending]: 'Bekliyor',
  [TaskStatus.Active]: 'Aktif',
  [TaskStatus.Completed]: 'Tamamlandı',
};

const statusReverseMap: { [key: string]: TaskStatus } = {
  'Bekliyor': TaskStatus.Pending,
  'Aktif': TaskStatus.Active,
  'Tamamlandı': TaskStatus.Completed,
};

// Helper to format a timestamp into a local ISO-like string (YYYY-MM-DDTHH:mm:ss)
// that is compatible with Airtable's date fields when "Use the same time zone for all collaborators" is enabled.
const formatToLocalISOWithoutTimezone = (timestamp: number): string => {
    const date = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
           `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// Helper to fetch all records from a table, handling pagination, with an optional filter.
const fetchAllRecords = async (apiUrl: string, filterByFormula?: string): Promise<any[]> => {
  let allRecords: any[] = [];
  let offset: string | undefined;
  const url = new URL(apiUrl);
  if (filterByFormula) {
      url.searchParams.append('filterByFormula', filterByFormula);
  }

  do {
    if (offset) {
      url.searchParams.set('offset', offset);
    } else {
      url.searchParams.delete('offset');
    }
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Airtable fetch failed');
    }
    const page = await response.json();
    allRecords = allRecords.concat(page.records);
    offset = page.offset;
  } while (offset);

  return allRecords;
};


// Deletes records in batches of 10
const deleteRecords = async (recordIds: string[], apiUrl: string) => {
  for (let i = 0; i < recordIds.length; i += 10) {
    const batch = recordIds.slice(i, i + 10);
    const params = batch.map(id => `records[]=${id}`).join('&');
    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Airtable delete failed');
    }
  }
};

// Creates records in batches of 10
const createRecords = async (records: any[], apiUrl: string) => {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ records: batch }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Airtable create failed');
    }
  }
};


// Syncs all tasks to Airtable by deleting all existing records and creating new ones.
export const airSync = async (workPackages: WorkPackage[], workers: Worker[]): Promise<void> => {
  try {
    // 1. Fetch all existing records to get their IDs for deletion
    const existingRecords = await fetchAllRecords(API_URL);
    const recordIdsToDelete: string[] = existingRecords.map((r: any) => r.id);

    // 2. Delete all existing records
    if (recordIdsToDelete.length > 0) {
      await deleteRecords(recordIdsToDelete, API_URL);
    }

    // 3. Prepare new records from current app state
    const workersMap = new Map(workers.map(w => [w.id, w.name]));
    const newRecords: any[] = [];

    workPackages.forEach(wp => {
      wp.tasks.forEach(task => {
        const assignedWorkerNames = task.assignedWorkerIds
          .map(id => workersMap.get(id))
          .filter(Boolean)
          .join(', ');

        const subtasksString = task.subTasks
          .map(st => {
            let line = `${st.completed ? '✔' : '☐'} ${st.title}`;
            if (st.completed && st.completionTime) {
              line += ` | ${new Date(st.completionTime).toISOString()}`;
            }
            return line;
          })
          .join('\n');

        newRecords.push({
          fields: {
            'Work Package': wp.title,
            'Company': wp.company || null,
            'Task Title': task.title, // Primary field
            'Status': statusMap[task.status],
            'Duration': task.durationSeconds ? task.durationSeconds / 60 : undefined,
            'Assigned Workers': assignedWorkerNames,
            'Subtask Checklist': subtasksString,
            'Manager Notes': task.managerNotes || '',
            'Start Time': task.startTime ? formatToLocalISOWithoutTimezone(task.startTime) : undefined,
            'End Time': task.endTime ? formatToLocalISOWithoutTimezone(task.endTime) : undefined,
            'ImageUrl': wp.imageUrl || null,
            'PdfUrl': wp.pdfUrl || null,
          },
        });
      });
    });

    // 4. Create new records
    if (newRecords.length > 0) {
      await createRecords(newRecords, API_URL);
    }

  } catch (error) {
    console.error('Error syncing with Airtable:', error);
    throw error;
  }
};

export const airFetch = async (initialWorkers: Worker[]): Promise<{ workPackages: WorkPackage[], workers: Worker[] }> => {
  try {
    const records = await fetchAllRecords(API_URL);

    const workPackagesMap = new Map<string, WorkPackage>();
    // Use the provided worker list and allow adding to it.
    const workers = [...initialWorkers];
    const workersMap = new Map<string, Worker>(workers.map(w => [w.name, w]));

    for (const record of records) {
      const fields = record.fields;
      const wpTitle = fields['Work Package'] || 'İsimsiz İş Paketi';
      const wpCompany = fields['Company'] || undefined;
      const wpKey = `${wpTitle}|${wpCompany || ''}`;

      if (!workPackagesMap.has(wpKey)) {
        workPackagesMap.set(wpKey, {
          id: `wp-fetch-${Date.now()}-${workPackagesMap.size}`,
          title: wpTitle,
          description: '',
          company: wpCompany,
          tasks: [],
          imageUrl: fields['ImageUrl'] || undefined,
          pdfUrl: fields['PdfUrl'] || undefined,
        });
      }
      const workPackage = workPackagesMap.get(wpKey)!;

      const assignedWorkerIds: string[] = [];
      const workerNames: string[] = (fields['Assigned Workers'] || '').split(',').map((name: string) => name.trim()).filter(Boolean);

      workerNames.forEach(name => {
        if (!workersMap.has(name)) {
          const randomNumber = Math.floor(Math.random() * 22) + 1;
          const newWorker: Worker = {
            id: `w-fetch-${Date.now()}-${workersMap.size}`,
            name: name,
            avatar: `https://cebi.com.tr/foto/${randomNumber}.png`,
          };
          workersMap.set(name, newWorker);
          workers.push(newWorker);
        }
        assignedWorkerIds.push(workersMap.get(name)!.id);
      });
      
      const subTasks: SubTask[] = (fields['Subtask Checklist'] || '').split('\n').map((line: string, index: number): SubTask | null => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;
        
        const completed = trimmedLine.startsWith('✔');
        let title = trimmedLine.replace(/^[✔☐]\s*/, '').trim();
        let completionTime: number | undefined = undefined;

        if (completed && title.includes(' | ')) {
            const parts = title.split(' | ');
            title = parts[0].trim();
            const dateString = parts[1] ? parts[1].trim() : '';
            if (dateString) {
                const parsedTimestamp = Date.parse(dateString);
                if (!isNaN(parsedTimestamp)) {
                    completionTime = parsedTimestamp;
                }
            }
        }
        
        return {
          id: `subtask-fetch-${record.id}-${index}`,
          title: title,
          completed: completed,
          completionTime: completionTime,
        };
      }).filter((st): st is SubTask => st !== null && st.title !== '');

      const task: Task = {
        id: `task-fetch-${record.id}`,
        title: fields['Task Title'] || 'İsimsiz Görev',
        status: statusReverseMap[fields['Status']] || TaskStatus.Pending,
        assignedWorkerIds: assignedWorkerIds,
        durationSeconds: (fields['Duration'] || 0) * 60,
        subTasks: subTasks,
        managerNotes: fields['Manager Notes'] || '',
        startTime: fields['Start Time'] ? Date.parse(fields['Start Time']) : undefined,
        endTime: fields['End Time'] ? Date.parse(fields['End Time']) : undefined,
      };
      
      workPackage.tasks.push(task);
    }

    const workPackages = Array.from(workPackagesMap.values());
    return { workPackages, workers };
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    throw error;
  }
};


export const airSyncTemplates = async (templates: WorkPackageTemplate[]): Promise<void> => {
  try {
    const existingRecords = await fetchAllRecords(TEMPLATE_API_URL, "({Status} = 'task')");
    const recordIdsToDelete: string[] = existingRecords.map((r: any) => r.id);

    if (recordIdsToDelete.length > 0) {
      await deleteRecords(recordIdsToDelete, TEMPLATE_API_URL);
    }
    
    const newRecords = templates.map(template => {
      const tasksString = template.tasks.map(task => {
        const titleLine = `${task.title} (${task.durationMinutes} min)`;
        const subTaskLines = task.subTasks.map(st => `- ${st.title}`).join('\n');
        return [titleLine, subTaskLines].filter(Boolean).join('\n');
      }).join('\n---\n');

      return {
        fields: {
          'Status': 'task',
          'Template Title': template.title,
          'Description': template.description,
          'Tasks': tasksString,
        }
      };
    });

    if (newRecords.length > 0) {
      await createRecords(newRecords, TEMPLATE_API_URL);
    }
  } catch (error) {
    console.error('Error syncing templates with Airtable:', error);
    throw error;
  }
};


export const airFetchTemplates = async (): Promise<WorkPackageTemplate[]> => {
  try {
    const records = await fetchAllRecords(TEMPLATE_API_URL, "({Status} = 'task')");

    return records.map((record: any, index: number): WorkPackageTemplate => {
      const fields = record.fields;
      
      const tasksString = fields['Tasks'] || '';
      const taskBlocks = tasksString.split('---').map((b: string) => b.trim()).filter(Boolean);
      
      const tasks: TaskTemplate[] = taskBlocks.map((block: string) => {
          const lines = block.split('\n').map(l => l.trim());
          const titleLine = lines.shift() || '';
          
          const titleMatch = titleLine.match(/(.*)\s\((\d+)\s*min\)/);
          const title = titleMatch ? titleMatch[1].trim() : titleLine;
          const durationMinutes = titleMatch ? parseInt(titleMatch[2], 10) : 25;
          
          const subTasks = lines.map((line: string) => {
              const subTaskTitle = line.replace(/^- \s*/, '').trim();
              return { title: subTaskTitle };
          }).filter((st: {title: string}) => st.title);
          
          return { title, durationMinutes, subTasks };
      }).filter((t: TaskTemplate) => t.title);

      return {
        id: `tpl-fetch-${Date.now()}-${index}`,
        title: fields['Template Title'] || 'İsimsiz Şablon',
        description: fields['Description'] || '',
        tasks: tasks,
      };
    });
  } catch (error) {
    console.error('Error fetching templates from Airtable:', error);
    throw error;
  }
};

export const airSyncWorkers = async (workers: Worker[]): Promise<void> => {
  try {
    const existingRecords = await fetchAllRecords(TEMPLATE_API_URL, "({Status} = 'personel')");
    const recordIdsToDelete: string[] = existingRecords.map((r: any) => r.id);

    if (recordIdsToDelete.length > 0) {
      await deleteRecords(recordIdsToDelete, TEMPLATE_API_URL);
    }

    const newRecords = workers.map(worker => {
      const match = worker.avatar.match(/cebi\.com\.tr\/foto\/(.+)\.png$/);
      const photoId = match && match[1] ? match[1] : undefined;
      
      return {
        fields: {
          'Status': 'personel',
          'Personel': worker.name,
          'PersonelID': photoId,
          'Company': worker.company || undefined,
          'Position': worker.position || undefined,
        },
      };
    });

    if (newRecords.length > 0) {
      await createRecords(newRecords, TEMPLATE_API_URL);
    }

  } catch (error) {
    console.error('Error syncing workers with Airtable:', error);
    throw error;
  }
};

export const airFetchWorkers = async (): Promise<Worker[]> => {
  try {
    const records = await fetchAllRecords(TEMPLATE_API_URL, "({Status} = 'personel')");

    const fetchedWorkers = records
      .filter((record: any) => record.fields.Personel)
      .map((record: any, index: number): Worker => {
        const fields = record.fields;
        const name = fields.Personel;
        const id = fields.PersonelID;
        const company = fields.Company;
        const position = fields.Position;
        
        let avatar = '';
        if (id) {
          avatar = `https://cebi.com.tr/foto/${id}.png`;
        } else {
          const randomNumber = Math.floor(Math.random() * 11) + 1;
          avatar = `https://cebi.com.tr/foto/random${randomNumber}.png`;
        }

        return {
          id: `w-fetch-${Date.now()}-${index}`,
          name: name,
          avatar: avatar,
          company: company,
          position: position,
        };
      });

    return fetchedWorkers;
  } catch (error) {
    console.error('Error fetching workers from Airtable:', error);
    throw error;
  }
};