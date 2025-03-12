import Appointment from '../models/Appointment.js';

class RequestValidator {
    constructor() {
        this.appointments = []; // Dit zou normaal gesproken uit een database komen
    }

    validate(appointment) {
        // Controleer of de datum en tijd al bezet zijn als voorbeeld
        const exists = this.appointments.some(
            (appt) => appt.date === appointment.date && appt.time === appointment.time
        );
        return !exists;
    }

    addAppointment(appointment) {
        if (this.validate(appointment)) {
            this.appointments.push(appointment);
            return false;
        }
        return true;
    }
}

export default RequestValidator;