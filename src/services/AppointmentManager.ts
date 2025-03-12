import Appointment from '../models/Appointment';

class AppointmentManager {
    validate(appointment: Appointment): boolean {
        return true;
    }

    checkAvailability(date: string, time: string): boolean {
        return true;
    }
}

export default AppointmentManager;