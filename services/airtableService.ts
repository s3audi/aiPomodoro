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

// Fetches the first record from the table.
export const airFetch = async (): Promise<{ recordId: string; data: string } | null> => {
  try {
    const response = await fetch(`${API_URL}?maxRecords=1`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Airtable fetch failed');
    }
    const result = await response.json();
    if (result.records && result.records.length > 0) {
      const record = result.records[0];
      // FIX: Changed field name from 'data' to 'Name' to match default Airtable primary field.
      if (typeof record.fields.Name === 'undefined') {
        throw new Error("Airtable tablosunda verileri saklamak için 'Name' adında birincil bir alan bulunmalıdır.");
      }
      return {
        recordId: record.id,
        data: record.fields.Name, 
      };
    }
    return null; // No records found
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    throw error;
  }
};

// Creates or updates a record.
export const airSync = async (data: string, recordId?: string): Promise<string> => {
  try {
    let response;
    // FIX: Changed field name from 'data' to 'Name' to match default Airtable primary field.
    const fields = { Name: data };

    if (recordId) {
      // Update existing record
      response = await fetch(`${API_URL}/${recordId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          fields: fields,
        }),
      });
    } else {
      // Create new record
      response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          records: [
            {
              fields: fields,
            },
          ],
        }),
      });
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Airtable sync failed');
    }
    const result = await response.json();
    
    // Return the ID of the created/updated record
    if (recordId) {
        return result.id;
    } else {
        return result.records[0].id;
    }

  } catch (error) {
    console.error('Error syncing with Airtable:', error);
    throw error;
  }
};
