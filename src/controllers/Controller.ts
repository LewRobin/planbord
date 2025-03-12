import AppointmentManager from '../services/AppointmentManager';
import Appointment from "../models/Appointment";

class Controller {
    private appointmentManager: AppointmentManager;

    constructor() {
        this.appointmentManager = new AppointmentManager();
    }

    getAppointments(page: number): Appointment[] {
        return [];
    }

    createAppointment(appointment: Appointment) {
    }

    updateAppointment(appointment: Appointment) {
    }

    deleteAppointment(id: string) {
    }

    notifyObservers() {
    }
}

export default Controller;