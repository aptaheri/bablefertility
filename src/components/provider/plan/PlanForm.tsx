import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSelectedPatient } from '../ProviderLayout';
import { toast } from 'react-toastify';
import {
  Form,
  FormGroup,
  Label,
  Select,
  Input,
  Button,
} from './StyledComponents';

interface Intervention {
  id: string;
  name: string;
  description: string;
}

interface Protocol {
  id: string;
  name: string;
  description: string;
  interventionId: string;
}

interface PlanFormProps {
  interventions: Intervention[];
  protocols: Protocol[];
  interventionsLoading: boolean;
  protocolsLoading: boolean;
  interventionsError: string | null;
  protocolsError: string | null;
  onPlanCreated: () => void;
}

const PlanForm: React.FC<PlanFormProps> = ({
  interventions,
  protocols,
  interventionsLoading,
  protocolsLoading,
  interventionsError,
  protocolsError,
  onPlanCreated,
}) => {
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();
  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPatient) return;

    try {
      setLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/stage-definitions/patient-stages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          interventionId: selectedIntervention,
          protocolId: selectedProtocol,
          startDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patient stages');
      }

      toast.success('Patient stages created successfully');
      // Reset form
      setSelectedIntervention('');
      setSelectedProtocol('');
      setStartDate('');
      // Notify parent
      onPlanCreated();
    } catch (error) {
      console.error('Error creating patient stages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create patient stages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="intervention">Intervention</Label>
        <Select
          id="intervention"
          value={selectedIntervention}
          onChange={(e) => setSelectedIntervention(e.target.value)}
          required
          disabled={interventionsLoading}
        >
          <option value="">
            {interventionsLoading 
              ? 'Loading interventions...' 
              : interventionsError 
                ? 'Error loading interventions' 
                : 'Select an Intervention'
            }
          </option>
          {interventions.map((intervention) => (
            <option key={intervention.id} value={intervention.id}>
              {intervention.name}
            </option>
          ))}
        </Select>
        {interventionsError && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {interventionsError}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="protocol">Protocol</Label>
        <Select
          id="protocol"
          value={selectedProtocol}
          onChange={(e) => setSelectedProtocol(e.target.value)}
          required
          disabled={protocolsLoading}
        >
          <option value="">
            {protocolsLoading 
              ? 'Loading protocols...' 
              : protocolsError 
                ? 'Error loading protocols' 
                : 'Select a Protocol'
            }
          </option>
          {protocols
            .filter(protocol => !selectedIntervention || protocol.interventionId === selectedIntervention)
            .map((protocol) => (
              <option key={protocol.id} value={protocol.id}>
                {protocol.name}
              </option>
            ))}
        </Select>
        {protocolsError && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {protocolsError}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </FormGroup>

      <Button 
        type="submit" 
        disabled={loading || interventionsLoading || protocolsLoading || !selectedIntervention || !selectedProtocol || !startDate}
      >
        {loading ? 'Creating...' : 'Create Plan'}
      </Button>
    </Form>
  );
};

export default PlanForm; 