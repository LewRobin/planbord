import { writable } from 'svelte/store';
import { AppointmentService } from '../../services/AppointmentService';

export interface Appointment {
    _id?: string;
    asset: string;
    startTime: number;
    endTime: number;
    title?: string;
    description?: string;
    createdAt?: Date;
}

const today = new Date(2025, 2, 27);
const todayTimestamp = Math.floor(today.getTime() / 1000);

const tomorrow = new Date(2025, 2, 28);
const tomorrowTimestamp = Math.floor(tomorrow.getTime() / 1000);

function createTimestamp(baseDate: Date, hours: number, minutes: number = 0): number {
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return Math.floor(date.getTime() / 1000);
}

const initialAppointments: Appointment[] = [
    {
        asset: "Project Studio",
        startTime: createTimestamp(today, 9, 0),
        endTime: createTimestamp(today, 11, 30),
        title: "Brainstormsessie",
        description: "Ideeën bespreken voor nieuw projectplan"
    },
    {
        asset: "Meeting Room A",
        startTime: createTimestamp(today, 13, 0),    // 27 maart 13:00
        endTime: createTimestamp(today, 14, 30),     // 27 maart 14:30
        title: "Klantgesprek",
        description: "Review van voortgang met klant"
    },
    {
        asset: "Equipment Set 1",
        startTime: createTimestamp(today, 15, 0),    // 27 maart 15:00
        endTime: createTimestamp(today, 17, 0),      // 27 maart 17:00
        title: "Opnames maken",
        description: "Audio-opnames voor nieuwe podcast"
    },
    {
        asset: "Project Studio",
        startTime: createTimestamp(tomorrow, 10, 0), // 28 maart 10:00
        endTime: createTimestamp(tomorrow, 12, 0),   // 28 maart 12:00
        title: "Ontwikkelteam meeting",
        description: "Wekelijkse sprint planning"
    },
    {
        asset: "Meeting Room B",
        startTime: createTimestamp(tomorrow, 14, 0), // 28 maart 14:00
        endTime: createTimestamp(tomorrow, 16, 0),   // 28 maart 16:00
        title: "Training sessie",
        description: "Training nieuwe medewerkers"
    }
];

export const appointments = writable<Appointment[]>(initialAppointments);

export async function loadAppointments() {
    try {
        const response = await AppointmentService.getAllAppointments();

        const data = response.data || response;

        if (data && Array.isArray(data) && data.length > 0) {
            appointments.set([...data]);
            return data;
        } else {
            appointments.set(initialAppointments);
            return initialAppointments;
        }
    } catch (error) {
        appointments.set(initialAppointments);
        return initialAppointments;
    }
}