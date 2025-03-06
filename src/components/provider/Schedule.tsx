import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import { toast } from 'react-toastify';
import 'react-calendar/dist/Calendar.css';
import 'react-toastify/dist/ReactToastify.css';
import { useSelectedPatient } from './ProviderLayout';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
`;

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
`;

const Sidebar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const AppointmentsList = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AppointmentCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
`;

const AppointmentInfo = styled.div`
  h4 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: #111827;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;

    &:not(:last-child) {
      margin-bottom: 0.25rem;
    }
  }
`;

const AppointmentTime = styled.div`
  text-align: right;
  color: #4f46e5;
  font-weight: 500;
`;

const ListTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #111827;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ErrorState = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-height: 100px;
  resize: vertical;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
  }
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  userId: string; // ID of the user creating the event
  patientId: string; // ID of the patient the event is for
  eventType: 
    | 'APPOINTMENT' 
    | 'FOLLOW_UP' 
    | 'CONSULTATION'
    | 'MEDICATION'
    | 'LAB_TEST'
    | 'LEGAL'
    | 'PROCEDURE'
    | 'MONITORING'
    | 'EDUCATION'
    | 'SUPPORT_GROUP'
    | 'FERTILITY_TREATMENT'
    | 'INSURANCE'
    | 'COUNSELING'
    | 'OTHER';
  createdAt?: string;
  updatedAt?: string;
  patientName?: string; // We'll add this when combining with patient data
}

interface CalendarEventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  eventType: CalendarEvent['eventType'];
}

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<CalendarEventFormData>({
    title: 'Initial Consultation',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    eventType: 'CONSULTATION'
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]); // Cache for all events
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();

  const fetchAppointments = useCallback(async () => {
    if (!currentUser || !selectedPatient) {
      setAllEvents([]);
      return;
    }

    try {
      setFetchingAppointments(true);
      
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/calendar/patient/${selectedPatient.id}`, {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      // Sort events by start time and store all events
      const sortedEvents = data.sort((a: CalendarEvent, b: CalendarEvent) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      setAllEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Unable to load appointments. Please try again later.');
    } finally {
      setFetchingAppointments(false);
    }
  }, [currentUser, selectedPatient]);

  // Filter events based on selected date
  const filteredEvents = useMemo(() => {
    if (!allEvents.length) return [];
    
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= selectedDateStart;
    });
  }, [allEvents, selectedDate]);

  // Group filtered events by date
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce((groups: { [key: string]: CalendarEvent[] }, event) => {
      const date = new Date(event.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {});
  }, [filteredEvents]);

  // Fetch appointments when selected patient changes or when component mounts
  useEffect(() => {
    fetchAppointments();
  }, [currentUser, selectedPatient, fetchAppointments]);

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAppointment = async () => {
    if (!currentUser || !selectedPatient) {
      toast.error('Please select a patient first', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const startTime = new Date(selectedDate);
    const [startHours, startMinutes] = formData.startTime.split(':');
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

    const endTime = new Date(selectedDate);
    const [endHours, endMinutes] = formData.endTime.split(':');
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    const eventData = {
      title: formData.title || 'Initial Consultation',
      description: formData.description || 'First meeting with patient',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      userId: currentUser.uid,
      patientId: selectedPatient.id,
      eventType: formData.eventType
    };

    try {
      setLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/calendar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      toast.success(`Appointment "${formData.title}" scheduled with ${selectedPatient.firstName} ${selectedPatient.lastName} for ${startTime.toLocaleString()}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form
      setFormData({
        title: 'Initial Consultation',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        eventType: 'CONSULTATION'
      });

      // Refresh events list
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!currentUser) return;

    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/calendar/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      toast.success('Appointment deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Refresh events list
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatAppointmentDate = (date: string) => {
    return new Date(date).toLocaleDateString([], { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <PageContainer>
      <Header>
        <Title>Schedule</Title>
      </Header>

      <CalendarContainer>
        <div>
          <StyledCalendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
          />

          <AppointmentsList>
            <ListTitle>
              {selectedPatient 
                ? `Appointments from ${selectedDate.toLocaleDateString()} for ${selectedPatient.firstName} ${selectedPatient.lastName}`
                : 'Upcoming Appointments'}
            </ListTitle>
            
            {!selectedPatient && (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                Please select a patient to view their appointments
              </p>
            )}

            {selectedPatient && fetchingAppointments ? (
              <LoadingState>
                Loading appointments...
              </LoadingState>
            ) : (
              <>
                {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                  <div key={date}>
                    <h4 style={{ margin: '1rem 0 0.5rem', color: '#4b5563' }}>
                      {formatAppointmentDate(date)}
                    </h4>
                    {dayEvents.map((event) => (
                      <AppointmentCard key={event.id}>
                        <AppointmentInfo>
                          <h4>{event.title}</h4>
                          <p>{event.description}</p>
                          <p>Type: {event.eventType}</p>
                        </AppointmentInfo>
                        <AppointmentTime>
                          {formatAppointmentTime(event.startTime, event.endTime)}
                        </AppointmentTime>
                        <DeleteButton
                          onClick={() => handleDeleteAppointment(event.id!)}
                          disabled={loading}
                        >
                          Delete
                        </DeleteButton>
                      </AppointmentCard>
                    ))}
                  </div>
                ))}
                {selectedPatient && !fetchingAppointments && filteredEvents.length === 0 && (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                    No appointments found from {selectedDate.toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </AppointmentsList>
        </div>

        <Sidebar>
          <h3>Create Appointment</h3>
          
          <FormGroup>
            <label htmlFor="title">Title</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Appointment title"
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="description">Description</label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add appointment details..."
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="eventType">Type</label>
            <Select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
            >
              <option value="APPOINTMENT">General Appointment</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="CONSULTATION">Consultation</option>
              <option value="MEDICATION">Medication</option>
              <option value="LAB_TEST">Lab Test</option>
              <option value="LEGAL">Legal</option>
              <option value="PROCEDURE">Procedure</option>
              <option value="MONITORING">Monitoring</option>
              <option value="EDUCATION">Education</option>
              <option value="SUPPORT_GROUP">Support Group</option>
              <option value="FERTILITY_TREATMENT">Fertility Treatment</option>
              <option value="INSURANCE">Insurance</option>
              <option value="COUNSELING">Counseling</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="startTime">Start Time</label>
            <Input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="endTime">End Time</label>
            <Input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
            />
          </FormGroup>

          <Button
            onClick={handleCreateAppointment}
            disabled={!selectedPatient || loading}
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </Button>
        </Sidebar>
      </CalendarContainer>
    </PageContainer>
  );
};

export default Schedule; 