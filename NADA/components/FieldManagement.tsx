import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Ruler, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  X,
  Save
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  location: string;
  size: string;
  status: 'good' | 'warning' | 'alert' | 'unknown';
  lastAnalysis?: string;
  analysisCount: number;
  notes?: string;
  createdAt: string;
}

interface FieldManagementProps {
  isOpen: boolean;
  onClose: () => void;
  allFields: Field[];
  onFieldsUpdated: (fields: Field[]) => void;
  selectedField: Field | null;
  onFieldSelected: (field: Field) => void;
}

interface NewFieldForm {
  name: string;
  location: string;
  size: string;
  sizeUnit: 'hectares' | 'acres' | 'square_meters';
  notes: string;
}

const commonLocations = [
  "North Sector", "South Sector", "East Sector", "West Sector",
  "Upper Field", "Lower Field", "Main Field", "Back Field",
  "River Side", "Hill Side", "Valley Field", "Terrace 1", "Terrace 2"
];

const sizeUnits = [
  { value: 'hectares', label: 'Hectares', symbol: 'ha' },
  { value: 'acres', label: 'Acres', symbol: 'ac' },
  { value: 'square_meters', label: 'Square Meters', symbol: 'm²' }
];

export function FieldManagement({ 
  isOpen, 
  onClose, 
  allFields, 
  onFieldsUpdated, 
  selectedField, 
  onFieldSelected 
}: FieldManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmField, setDeleteConfirmField] = useState<Field | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [newField, setNewField] = useState<NewFieldForm>({
    name: '',
    location: '',
    size: '',
    sizeUnit: 'hectares',
    notes: ''
  });

  const resetForm = () => {
    setNewField({
      name: '',
      location: '',
      size: '',
      sizeUnit: 'hectares',
      notes: ''
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newField.name.trim()) {
      errors.name = 'Field name is required';
    } else if (allFields.some(f => f.name.toLowerCase() === newField.name.trim().toLowerCase())) {
      errors.name = 'Field name already exists';
    }
    
    if (!newField.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!newField.size.trim()) {
      errors.size = 'Size is required';
    } else {
      const sizeNum = parseFloat(newField.size);
      if (isNaN(sizeNum) || sizeNum <= 0) {
        errors.size = 'Size must be a positive number';
      } else if (sizeNum > 1000 && newField.sizeUnit === 'hectares') {
        errors.size = 'Size seems too large (max 1000 hectares)';
      } else if (sizeNum > 2471 && newField.sizeUnit === 'acres') {
        errors.size = 'Size seems too large (max 2471 acres)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddField = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const sizeUnit = sizeUnits.find(u => u.value === newField.sizeUnit);
      const formattedSize = `${newField.size} ${sizeUnit?.symbol || newField.sizeUnit}`;
      
      const field: Field = {
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newField.name.trim(),
        location: newField.location.trim(),
        size: formattedSize,
        status: 'unknown',
        analysisCount: 0,
        notes: newField.notes.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      // Save to backend
      try {
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/fields`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ field })
        });
        
        console.log('✅ Field saved to backend:', field.name);
      } catch (error) {
        console.warn('⚠️ Failed to save field to backend, storing locally:', error);
      }

      const updatedFields = [...allFields, field];
      onFieldsUpdated(updatedFields);
      
      // Auto-select the new field
      onFieldSelected(field);
      
      resetForm();
      setShowAddForm(false);
      
      console.log('✅ New field added:', field);
      
    } catch (error) {
      console.error('❌ Error adding field:', error);
      setFormErrors({ submit: 'Failed to add field. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteField = async (field: Field) => {
    try {
      // Remove from backend
      try {
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/fields/${field.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        });
        
        console.log('✅ Field deleted from backend:', field.name);
      } catch (error) {
        console.warn('⚠️ Failed to delete field from backend, removing locally:', error);
      }

      const updatedFields = allFields.filter(f => f.id !== field.id);
      onFieldsUpdated(updatedFields);
      
      // If deleted field was selected, select another or clear
      if (selectedField?.id === field.id) {
        const remainingFields = updatedFields;
        onFieldSelected(remainingFields.length > 0 ? remainingFields[0] : null);
      }
      
      setDeleteConfirmField(null);
      console.log('✅ Field deleted:', field.name);
      
    } catch (error) {
      console.error('❌ Error deleting field:', error);
    }
  };

  const getFieldStatusBadge = (field: Field) => {
    switch (field.status) {
      case 'good':
        return <Badge className="fairy-accent-good text-xs">Healthy</Badge>;
      case 'warning':
        return <Badge className="fairy-accent-warning text-xs">Warning</Badge>;
      case 'alert':
        return <Badge className="fairy-accent-alert text-xs">Critical</Badge>;
      default:
        return <Badge variant="outline" className="text-xs border-sage-300">No Data</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto fairy-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sage-600" />
              Manage Paddy Fields
            </DialogTitle>
            <DialogDescription>
              Add new paddy fields to monitor or remove existing ones. Select a field to view its details and analysis history.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add New Field Button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-700">Manage your rice paddy fields</p>
                <p className="text-sm text-sage-600">Add new fields or remove existing ones</p>
              </div>
              <Button 
                onClick={() => {
                  setShowAddForm(true);
                  resetForm();
                }}
                className="fairy-button-primary"
                disabled={showAddForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Field
              </Button>
            </div>

            {/* Add Field Form */}
            {showAddForm && (
              <Card className="p-6 fairy-card border-sage-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-sage-800">Add New Paddy Field</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Field Name */}
                    <div>
                      <Label htmlFor="fieldName">Field Name *</Label>
                      <Input
                        id="fieldName"
                        placeholder="e.g., Field D, Main Field"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className={`mt-1 ${formErrors.name ? 'border-dusty-pink-400' : 'border-sage-300'}`}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-dusty-pink-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <Label htmlFor="fieldLocation">Location *</Label>
                      <Select 
                        value={newField.location} 
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            setNewField({ ...newField, location: '' });
                          } else {
                            setNewField({ ...newField, location: value });
                          }
                        }}
                      >
                        <SelectTrigger className={`mt-1 ${formErrors.location ? 'border-dusty-pink-400' : 'border-sage-300'}`}>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Location...</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {newField.location === '' && (
                        <Input
                          placeholder="Enter custom location"
                          value={newField.location}
                          onChange={(e) => setNewField({ ...newField, location: e.target.value })}
                          className="mt-2"
                        />
                      )}
                      
                      {formErrors.location && (
                        <p className="text-sm text-dusty-pink-600 mt-1">{formErrors.location}</p>
                      )}
                    </div>

                    {/* Size */}
                    <div>
                      <Label htmlFor="fieldSize">Field Size *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="fieldSize"
                          type="number"
                          placeholder="0.0"
                          step="0.1"
                          min="0"
                          value={newField.size}
                          onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                          className={`flex-1 ${formErrors.size ? 'border-dusty-pink-400' : 'border-sage-300'}`}
                        />
                        <Select 
                          value={newField.sizeUnit} 
                          onValueChange={(value: 'hectares' | 'acres' | 'square_meters') => 
                            setNewField({ ...newField, sizeUnit: value })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sizeUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {formErrors.size && (
                        <p className="text-sm text-dusty-pink-600 mt-1">{formErrors.size}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="fieldNotes">Notes (Optional)</Label>
                      <Textarea
                        id="fieldNotes"
                        placeholder="Additional information about this field"
                        value={newField.notes}
                        onChange={(e) => setNewField({ ...newField, notes: e.target.value })}
                        className="mt-1 border-sage-300 h-20"
                      />
                    </div>
                  </div>

                  {formErrors.submit && (
                    <div className="flex items-center gap-2 p-3 bg-dusty-pink-50 border border-dusty-pink-200 rounded">
                      <AlertTriangle className="w-4 h-4 text-dusty-pink-600" />
                      <p className="text-sm text-dusty-pink-700">{formErrors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleAddField}
                      disabled={isSubmitting}
                      className="fairy-button-primary"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin mr-2" />
                          Adding Field...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Add Field
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Existing Fields List */}
            <div>
              <h3 className="text-lg font-semibold text-sage-800 mb-4">Your Paddy Fields ({allFields.length})</h3>
              
              {allFields.length === 0 ? (
                <Card className="p-8 text-center fairy-card">
                  <MapPin className="w-12 h-12 text-sage-400 mx-auto mb-3" />
                  <p className="text-sage-600 mb-2">No paddy fields added yet</p>
                  <p className="text-sm text-sage-500">Add your first field to start monitoring water quality</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allFields.map((field) => (
                    <Card key={field.id} className="p-4 fairy-card hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sage-800">{field.name}</h4>
                            <div className="flex items-center gap-1 text-sm text-sage-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              {field.location}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-sage-600 mt-1">
                              <Ruler className="w-3 h-3" />
                              {field.size}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getFieldStatusBadge(field)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmField(field)}
                              className="h-8 w-8 p-0 text-dusty-pink-600 hover:text-dusty-pink-700 hover:bg-dusty-pink-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-sage-600">Analyses:</span>
                            <span className="font-medium text-sage-800">{field.analysisCount}</span>
                          </div>
                          {field.lastAnalysis && (
                            <div className="flex justify-between text-sm">
                              <span className="text-sage-600">Last Check:</span>
                              <span className="font-medium text-sage-800">
                                {new Date(field.lastAnalysis).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {field.notes && (
                          <div className="pt-2 border-t border-sage-200">
                            <div className="flex items-start gap-1 text-sm text-sage-600">
                              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <p className="text-xs">{field.notes}</p>
                            </div>
                          </div>
                        )}

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={() => {
                            onFieldSelected(field);
                            onClose();
                          }}
                        >
                          {selectedField?.id === field.id ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-2" />
                              Currently Selected
                            </>
                          ) : (
                            'Select Field'
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmField !== null} onOpenChange={() => setDeleteConfirmField(null)}>
        <AlertDialogContent className="fairy-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />
              Delete Paddy Field
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteConfirmField?.name}</strong>? 
              This will permanently remove the field and all its analysis history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirmField && handleDeleteField(deleteConfirmField)}
              className="bg-dusty-pink-600 hover:bg-dusty-pink-700 text-cream-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Field
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}