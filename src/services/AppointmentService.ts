import type { Appointment } from '../components/appointment/AppointmentData';

const API_URL = 'http://localhost:3000/api';

export class AppointmentService {
    static async getAllAppointments(): Promise<{data: Appointment[]}> {
        try {
            console.log("Fetching appointments from:", API_URL);
            const response = await fetch(`${API_URL}/appointments`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    static async createAppointment(appointment: Omit<Appointment, '_id'>): Promise<Appointment> {
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointment),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    static async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
        try {
            const response = await fetch(`${API_URL}/appointments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointment),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    static async deleteAppointment(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/appointments/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    static async convertToTimestamp(date: string, time?: string): Promise<number> {
        try {
            const response = await fetch(`${API_URL}/convert-to-timestamp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, time }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.timestamp;
        } catch (error) {
            console.error('Error converting to timestamp:', error);
            throw error;
        }
    }
}