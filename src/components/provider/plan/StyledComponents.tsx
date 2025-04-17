import styled from '@emotion/styled';

export const PlanContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

export const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  color: #374151;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #FFD900;
    box-shadow: 0 0 0 2px rgba(255, 217, 0, 0.2);
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  color: #374151;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #FFD900;
    box-shadow: 0 0 0 2px rgba(255, 217, 0, 0.2);
  }
`;

export const Button = styled.button`
  background-color: #FFD900;
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e6c300;
  }
  
  &:disabled {
    background-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

export const PlanDisplay = styled.div`
  margin-top: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const StageContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

export const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const StageTitle = styled.h3`
  margin: 0;
  color: #1e293b;
`;

export const StageDescription = styled.p`
  color: #64748b;
  margin: 0.5rem 0;
`;

export const TasksList = styled.div`
  margin-top: 1rem;
`;

export const TaskItem = styled.div`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: #f8fafc;
`;

export const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const TaskTitle = styled.h4`
  margin: 0;
  color: #1e293b;
`;

export const TaskDescription = styled.p`
  color: #64748b;
  margin: 0.25rem 0;
  font-size: 0.875rem;
`;

export const TaskMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
`;

export const EventsList = styled.div`
  margin-top: 1rem;
`;

export const EventItem = styled.div`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: #f0f9ff;
`;

export const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const EventTitle = styled.h4`
  margin: 0;
  color: #0369a1;
`;

export const EventDescription = styled.p`
  color: #64748b;
  margin: 0.25rem 0;
  font-size: 0.875rem;
`;

export const EventTime = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

export const UpdateDateButton = styled.button`
  background-color: #FFD900;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 1rem;
  
  &:hover {
    background-color: #e6c300;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

export const ModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #1e293b;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const CancelButton = styled.button`
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #d1d5db;
  }
`;

export const SaveButton = styled.button`
  background-color: #FFD900;
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e6c300;
  }
  
  &:disabled {
    background-color: #e5e7eb;
    cursor: not-allowed;
  }
`; 