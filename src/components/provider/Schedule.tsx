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
  grid-template-columns: 1fr auto;
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

interface Appointment {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  patientId: string;
  eventType: 'APPOINTMENT' | 'FOLLOW_UP' | 'CONSULTATION';
  createdAt?: string;
  updatedAt?: string;
  patientName?: string; // We'll add this when combining with patient data
}

interface AppointmentFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  eventType: 'APPOINTMENT' | 'FOLLOW_UP' | 'CONSULTATION';
  duration: number;
}

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: 'Initial Consultation',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    eventType: 'CONSULTATION',
    duration: 60
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]); // Cache for all appointments
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();

  const fetchAppointments = useCallback(async () => {
    if (!currentUser || !selectedPatient) {
      setAllAppointments([]);
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
      // Sort appointments by start time and store all appointments
      const sortedAppointments = data.sort((a: Appointment, b: Appointment) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      setAllAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Unable to load appointments. Please try again later.');
    } finally {
      setFetchingAppointments(false);
    }
  }, [currentUser, selectedPatient]);

  // Filter appointments based on selected date
  const filteredAppointments = useMemo(() => {
    if (!allAppointments.length) return [];
    
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    return allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate >= selectedDateStart;
    });
  }, [allAppointments, selectedDate]);

  // Group filtered appointments by date
  const groupedAppointments = useMemo(() => {
    return filteredAppointments.reduce((groups: { [key: string]: Appointment[] }, appointment) => {
      const date = new Date(appointment.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});
  }, [filteredAppointments]);

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
    setFormData(prev => {
      const updates: Partial<AppointmentFormData> = { [name]: value };
      
      // Update end time when start time or duration changes
      if (name === 'startTime' || name === 'duration') {
        const [hours, minutes] = prev.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);
        const endDate = new Date(startDate);
        endDate.setMinutes(startDate.getMinutes() + (name === 'duration' ? parseInt(value) : prev.duration));
        updates.endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      }
      
      return { ...prev, ...updates };
    });
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
        eventType: 'CONSULTATION',
        duration: 60
      });

      // Refresh appointments list
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
                {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
                  <div key={date}>
                    <h4 style={{ margin: '1rem 0 0.5rem', color: '#4b5563' }}>
                      {formatAppointmentDate(date)}
                    </h4>
                    {dayAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id}>
                        <AppointmentInfo>
                          <h4>{appointment.title}</h4>
                          <p>{appointment.description}</p>
                          <p>Type: {appointment.eventType}</p>
                        </AppointmentInfo>
                        <AppointmentTime>
                          {formatAppointmentTime(appointment.startTime, appointment.endTime)}
                        </AppointmentTime>
                      </AppointmentCard>
                    ))}
                  </div>
                ))}
                {selectedPatient && !fetchingAppointments && filteredAppointments.length === 0 && (
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
              <option value="CONSULTATION">Consultation</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="APPOINTMENT">General Appointment</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="startTime">Start Time</label>
            <Select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
            >
              {Array.from({ length: 21 }, (_, i) => i + 3).map((hour) => (
                <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                  {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="duration">Duration</label>
            <Select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </Select>
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