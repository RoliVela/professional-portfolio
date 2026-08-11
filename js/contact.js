import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.mjs";

const EMAILJS_PUBLIC_KEY = "oDIeWekvzQ-T5cZ3_";
const EMAILJS_SERVICE_ID = "service_yhj0w9x";
const EMAILJS_TEMPLATE_ID = "template_grf1cz9";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const form = document.getElementById("contactForm");
const status = document.getElementById("cf-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  status.textContent = "Sending…";
  status.classList.remove("is-error");

  try {
    await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
    status.textContent = "Message sent — thanks, I'll get back to you soon.";
    form.reset();
  } catch (err) {
    status.textContent = "Something went wrong sending that — try email directly instead.";
    status.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
  }
});
