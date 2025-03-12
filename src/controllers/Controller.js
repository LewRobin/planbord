import Appointment from '../models/Appointment.js';
import AppointmentManager from '../services/AppointmentManager.js';

class Controller {
    constructor() {
        this.appointmentManager = new AppointmentManager();
    }

    createAppointment(date, time, details) {
        const appointment = new Appointment(Date.now().toString(), date, time, details);
        return this.appointmentManager.addAppointment(appointment);
    }

    deleteAppointment(id) {
        return this.appointmentService.deleteAppointment(id);
    }

    updateAppointment(id, details, date) {
        return this.appointmentService.updateAppointment(id, details, date);
    }
}

export default Controller;