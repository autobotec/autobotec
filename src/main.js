import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitButton = contactForm.querySelector('.form-button');
  const originalText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  formMessage.innerHTML = '';

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    company: document.getElementById('company').value,
    message: document.getElementById('message').value,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([formData])
      .select();

    if (error) throw error;

    formMessage.innerHTML = '<div class="form-message success">¡Mensaje enviado con éxito! Te contactaremos pronto.</div>';
    contactForm.reset();
  } catch (error) {
    console.error('Error:', error);
    formMessage.innerHTML = '<div class="form-message error">Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.</div>';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.service-card, .benefit-item, .testimonial-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});
