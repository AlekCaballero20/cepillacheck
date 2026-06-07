import { byId } from '../../core/dom.js';
import { state } from '../../core/state.js';
import { showToast } from '../../core/toast.js';
import { addCareItem, addDentalVisit, addSymptom, getCareItems, getDentalVisits, getSymptoms } from '../../services/care.service.js';
import { prepareCareDefaults, readKitForm, readSymptomForm, readVisitForm, renderKit, renderSymptoms, renderVisits, resetKitForm, resetSymptomForm, resetVisitForm } from './care.ui.js';

let bound = false;

export function bindCareEvents() {
  if (bound) return;
  bound = true;
  byId('symptom-intensity')?.addEventListener('input', (event) => {
    byId('symptom-intensity-label').textContent = event.target.value;
  });
  byId('symptom-form')?.addEventListener('submit', saveSymptom);
  byId('kit-form')?.addEventListener('submit', saveKitItem);
  byId('visit-form')?.addEventListener('submit', saveVisit);
}

export async function loadCare() {
  if (!state.currentUser) return;
  prepareCareDefaults();
  const [symptoms, kit, visits] = await Promise.all([
    getSymptoms(state.currentUser.id),
    getCareItems(state.currentUser.id),
    getDentalVisits(state.currentUser.id),
  ]);
  renderSymptoms(symptoms);
  renderKit(kit);
  renderVisits(visits);
}

async function saveSymptom(event) {
  event.preventDefault();
  if (!state.currentUser) return;
  try {
    await addSymptom(state.currentUser.id, readSymptomForm());
    resetSymptomForm();
    await loadCare();
    showToast('Señal guardada', 'success');
  } catch {
    showToast('No se pudo guardar la señal', 'error');
  }
}

async function saveKitItem(event) {
  event.preventDefault();
  if (!state.currentUser) return;
  try {
    await addCareItem(state.currentUser.id, readKitForm());
    resetKitForm();
    await loadCare();
    showToast('Kit actualizado', 'success');
  } catch {
    showToast('No se pudo guardar el insumo', 'error');
  }
}

async function saveVisit(event) {
  event.preventDefault();
  if (!state.currentUser) return;
  try {
    await addDentalVisit(state.currentUser.id, readVisitForm());
    resetVisitForm();
    await loadCare();
    showToast('Visita guardada', 'success');
  } catch {
    showToast('No se pudo guardar la visita', 'error');
  }
}
