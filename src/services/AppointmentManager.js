import RequestValidator from './RequestValidator.js';

class AppointmentManager {
    constructor() {
        this.validator = new RequestValidator();
    }

    addAppointment(appointment) {
        console.log(appointment);
        return this.validator.addAppointment(appointment);
    }

    deleteAppointment(id) {
        const index = this.appointments.findIndex(appointment => appointment.id === id);
        if (index !== -1) {
            this.appointments.splice(index, 1);
            return true;
        }
        return false;
    }

    updateAppointment(id, details, date) {
        const appointmentToUpdate = this.appointments.find(appointment => appointment.id === id);
        return false;
    }
}

export default AppointmentManager;