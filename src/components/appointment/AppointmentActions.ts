import type { Appointment } from './AppointmentData';
import { AppointmentService } from '@/services/AppointmentService';
import { loadAppointments } from './AppointmentData';
import { calculateTimestampFromPosition, calculateEndTimeFromWidth } from '@/utils/calculations';

export async function deleteAppointment(appointment: Appointment): Promise<boolean> {
    try {
        if (appointment._id) {
            await AppointmentService.deleteAppointment(appointment._id);
        }
        await loadAppointments();
        return true;
    } catch (error) {
        console.error('Fout bij het verwijderen van afspraak:', error);
        return false;
    }
}

export async function savePositionChange(
    appointment: Appointment,
    newLeft: number,
    scale: number,
    cellWidthPx: number,
    dayStartTimestamp: number
): Promise<boolean> {
    try {
        const timeDiff = appointment.endTime - appointment.startTime;
        const newStartTime = calculateTimestampFromPosition(
            newLeft, scale, cellWidthPx, dayStartTimestamp, appointment.startTime
        );
        const newEndTime = newStartTime + timeDiff;

        if (newStartTime !== appointment.startTime) {
            await saveAppointmentChanges(appointment, { startTime: newStartTime, endTime: newEndTime });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Fout bij bijwerken van positie:', error);
        return false;
    }
}

export async function saveResizeChange(
    appointment: Appointment,
    newWidth: number,
    scale: number,
    cellWidthPx: number
): Promise<boolean> {
    try {
        const newEndTime = calculateEndTimeFromWidth(
            appointment.startTime, newWidth, scale, cellWidthPx, appointment.endTime
        );

        if (newEndTime !== appointment.endTime) {
            await saveAppointmentChanges(appointment, { endTime: newEndTime });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Fout bij bijwerken van grootte:', error);
        return false;
    }
}

async function saveAppointmentChanges(
    appointment: Appointment,
    changes: Partial<Appointment>
): Promise<void> {
    if (!appointment._id) throw new Error('Afspraak heeft geen ID');

    await AppointmentService.updateAppointment(appointment._id, changes);
    await loadAppointments();
}