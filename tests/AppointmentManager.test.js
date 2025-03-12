import AppointmentManager from '../src/services/AppointmentManager.js';

jest.mock('../src/services/RequestValidator.js', () => {
    return jest.fn().mockImplementation(() => {
        return {addAppointment: jest.fn(appointment => true)};
    });
});

describe('AppointmentManager', () => {
    let appointmentManager;
    const appointment = {id: '1', details: 'Detail', date: '2022-03-01'};

    beforeEach(() => {
        appointmentManager = new AppointmentManager();
    });

    it("adds the appointment correctly", () => {
        const response = appointmentManager.addAppointment(appointment);
        expect(response).toBe(true);
        expect(appointmentManager.validator.addAppointment).toHaveBeenCalledWith(appointment);
    });

    it("removes the appointment correctly", () => {
        appointmentManager.appointments = [appointment];
        const response = appointmentManager.deleteAppointment('1');
        expect(response).toBe(true);
        expect(appointmentManager.appointments.length).toBe(0);
    });

    it("not updates the appointment", () => {
        appointmentManager.appointments = [appointment];
        const response = appointmentManager.updateAppointment('1');
        expect(response).toBe(true);
    });
}); 