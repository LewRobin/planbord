class Appointment {
    private id: any;
    private date: any;
    private time: any;
    private details: any;

    constructor(id, date, time, details) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.details = details;
    }
}

export default Appointment;