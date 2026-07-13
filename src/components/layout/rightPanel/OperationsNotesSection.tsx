import { useUIStore } from '@/store/modules/ui';
import { useIncidentStore } from '@/store/modules/incident';
import { SharedNotes } from '@/components/shared/SharedNotes';
import { PanelSection } from './PanelSection';

export function OperationsNotesSection() {
  const { operationsNotes, setOperationsNotes, shiftNotes, addShiftNote, deleteShiftNote } = useUIStore();
  const { addToast, addActivity } = useIncidentStore();

  const handleSave = () => {
    if (!operationsNotes.trim()) return;
    addShiftNote(operationsNotes);
    addToast('Shift note saved', 'success');
    addActivity('Rahul Asthwik added a shift note', 'Rahul Asthwik', 'low');
  };

  const handleDelete = (id: string) => {
    deleteShiftNote(id);
    addToast('Shift note deleted', 'info');
  };

  return (
    <PanelSection title="Operations Notes" className="py-2">
      <SharedNotes
        draft={operationsNotes}
        notes={shiftNotes}
        onChangeDraft={setOperationsNotes}
        onSave={handleSave}
        onDelete={handleDelete}
        placeholder="Type a shift log entry (Ctrl+Enter to save)..."
        historyTitle="Shift Log"
        ariaLabel="Operations shift handover notes"
        maxHeightClass="max-h-36"
      />
    </PanelSection>
  );
}
