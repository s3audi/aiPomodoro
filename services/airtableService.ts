import type { WorkPackage, Worker, Task, SubTask } from '../types';
import { TaskStatus } from '../types';

// Adım 3'te oluşturduğunuz Personal Access Token'ı buraya yapıştırın.
const AIRTABLE_API_KEY = 'patY2yGLrAfh96M1s.f412990b6f78681ed7672e83e61da73c36b6ae34ca5c0c7cb908f871c4b089b8';
// Adım 4'te bulduğunuz Base ID'yi buraya yapıştırın.
const AIRTABLE_BASE_ID = 'appgMyZNvnJMRCqT1';
// Adım 2'de oluşturduğunuz veya belirlediğiniz tablonun adını buraya yazın.
const AIRTABLE_TABLE_NAME = 'Pomodoro';

const API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

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

// Deletes records in batches of 10
const deleteRecords = async (recordIds: string[]) => {
  for (let i = 0; i < recordIds.length; i += 10) {
    const batch = recordIds.slice(i, i + 10);
    const params = batch.map(id => `records[]=${id}`).join('&');
    const response = await fetch(`${API_URL}?${params}`, {
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
const createRecords = async (records: any[]) => {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const response = await fetch(API_URL, {
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
    const fetchResponse = await fetch(API_URL, { headers });
    if (!fetchResponse.ok) {
      const error = await fetchResponse.json();
      throw new Error(error.error?.message || 'Airtable fetch for deletion failed');
    }
    const existingRecords = await fetchResponse.json();
    const recordIdsToDelete: string[] = existingRecords.records.map((r: any) => r.id);

    // 2. Delete all existing records
    if (recordIdsToDelete.length > 0) {
      await deleteRecords(recordIdsToDelete);
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
          .map(st => `${st.completed ? '✔' : '☐'} ${st.title}`)
          .join('\n');

        newRecords.push({
          fields: {
            'Work Package': wp.title,
            'Task Title': task.title, // Primary field
            'Status': statusMap[task.status],
            'Duration': task.durationSeconds ? task.durationSeconds / 60 : undefined,
            'Assigned Workers': assignedWorkerNames,
            'Subtask Checklist': subtasksString,
            'Manager Notes': task.managerNotes || '',
            'Start Time': task.startTime ? formatToLocalISOWithoutTimezone(task.startTime) : undefined,
            'End Time': task.endTime ? formatToLocalISOWithoutTimezone(task.endTime) : undefined,
          },
        });
      });
    });

    // 4. Create new records
    if (newRecords.length > 0) {
      await createRecords(newRecords);
    }

  } catch (error) {
    console.error('Error syncing with Airtable:', error);
    throw error;
  }
};

export const airFetch = async (): Promise<{ workPackages: WorkPackage[], workers: Worker[] }> => {
  try {
    const response = await fetch(API_URL, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Airtable fetch failed');
    }
    const { records } = await response.json();

    const workPackagesMap = new Map<string, WorkPackage>();
    const workersMap = new Map<string, Worker>(); // Map name to Worker object

    for (const record of records) {
      const fields = record.fields;
      const wpTitle = fields['Work Package'] || 'İsimsiz İş Paketi';

      // Ensure work package exists
      if (!workPackagesMap.has(wpTitle)) {
        workPackagesMap.set(wpTitle, {
          id: `wp-fetch-${Date.now()}-${workPackagesMap.size}`,
          title: wpTitle,
          description: '', // NOTE: Airtable schema doesn't store WP description.
          tasks: [],
        });
      }
      const workPackage = workPackagesMap.get(wpTitle)!;

      // Parse workers
      const assignedWorkerIds: string[] = [];
      const workerNames: string[] = (fields['Assigned Workers'] || '').split(',').map((name: string) => name.trim()).filter(Boolean);
      
      workerNames.forEach(name => {
        if (!workersMap.has(name)) {
          workersMap.set(name, {
            id: `w-fetch-${Date.now()}-${workersMap.size}`,
            name: name,
            avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`
          });
        }
        assignedWorkerIds.push(workersMap.get(name)!.id);
      });

      // Parse subtasks
      const subTasks: SubTask[] = (fields['Subtask Checklist'] || '').split('\n').map((line: string, index: number): SubTask | null => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;
        const completed = trimmedLine.startsWith('✔');
        const title = trimmedLine.replace(/^[✔☐]\s*/, '').trim();
        return {
          id: `subtask-fetch-${record.id}-${index}`,
          title: title,
          completed: completed,
        };
      }).filter((st): st is SubTask => st !== null && st.title !== '');


      // Create task
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
    const workers = Array.from(workersMap.values());

    return { workPackages, workers };
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    throw error;
  }
};