import { validationSeccion1 } from './validationsSeccion1.js';

export function initializeNavigation(root = document) {
  let currentStep = 0;

  const navigator = root.querySelector('#navigator');
  const groupsTrack = navigator.querySelector('.groups-track');
  const groups = navigator.querySelectorAll('.navigable-group');
  const navLeftBtn = navigator.querySelector('#navLeft');
  const navRightBtn = navigator.querySelector('#navRight');
  const progress = navigator.querySelector('#step-progress');
  const step1 = document.querySelector('#step1');
  const step2 = document.querySelector('#step2');
  const step3 = document.querySelector('#step3');

  const registration = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  const firstNameInput = navigator.querySelector('#inputName');
  const lastNameInput = navigator.querySelector('#inputLastName');
  const userEmail = navigator.querySelector('#inputEmail');
  const userPhone = navigator.querySelector('#inputPhone');

  firstNameInput.addEventListener('input', updateFirstName);
  lastNameInput.addEventListener('input', updateLastName);
  userEmail.addEventListener('input', updateUserEmail);
  userPhone.addEventListener('input', updateUserPhone);

  function updateFirstName() {
    registration.firstName = firstNameInput.value;
  }

  function updateLastName() {
    registration.lastName = lastNameInput.value;
  }

  function updateUserEmail() {
    registration.email = userEmail.value;
  }

  function updateUserPhone() {
    registration.phone = userPhone.value;
  }

  function updateSectionPosition(moveFocus = false) {
    groupsTrack.style.transform = `translateX(-${currentStep * 100}%)`;

    groups.forEach((group, index) => {
      group.toggleAttribute('inert', index !== currentStep);
    });

    navLeftBtn.disabled = currentStep === 0;
    navLeftBtn.classList.toggle('btn-azul', currentStep > 0);
    navRightBtn.disabled = currentStep === groups.length - 1;
    progress.textContent = `Sección ${currentStep + 1} de ${groups.length}`;
    step1.classList.toggle('active', currentStep === 0);
    step2.classList.toggle('active', currentStep === 1);
    step3.classList.toggle('active', currentStep === 2);

    if (moveFocus) {
      groups[currentStep].querySelector('h2').focus({ preventScroll: true });
    }
  }

  function goToPreviousStep() {
    if (currentStep > 0) {
      currentStep -= 1;
      updateSectionPosition(true);
    }
  }

  function goToNextStep() {

    if(currentStep===0){
      const errors=validationSeccion1(registration)
      if (Object.keys(errors).length>0){
        const nameInput=navigator.querySelector("#inputName")
        const nameError=nameInput.closest(".form-group").querySelector(".errorgit")
        return;
      }
    }

    if (currentStep < groups.length - 1) {
      currentStep += 1;
      updateSectionPosition(true);
    }
  }

  navLeftBtn.addEventListener('click', goToPreviousStep);
  navRightBtn.addEventListener('click', goToNextStep);

  updateSectionPosition();
}
