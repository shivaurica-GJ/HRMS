import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';

const HrCalendarPage = () => {
  const [holidays, setHolidays] = useState([]);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get('/api/holidays');
      setHolidays(res.data);
    } catch (error) {
      console.error('Failed to fetch holidays', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const eventContent = (eventInfo) => (
    <>
      <b>{eventInfo.timeText}</b>
      <i> {eventInfo.event.title}</i>
    </>
  );

  return (
    <div className="container mt-4">
      <h2>Company Holiday Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        events={holidays.map(h => ({
          id: h._id,
          title: h.title,
          start: h.start_date,
          end: h.end_date,
          allDay: true,
        }))}
        eventContent={eventContent}
        height="auto"
      />
    </div>
  );
};

export default HrCalendarPage;
