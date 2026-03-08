const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "form-status";
  if (type) statusEl.classList.add(type);
}

function validateEgyptPhone(phone) {
  const normalized = phone.replace(/\s+/g, "");
  return /^01[0-2,5]{1}[0-9]{8}$/.test(normalized);
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const message = formData.get("message")?.toString().trim() || "";
  const honeypot = formData.get("_gotcha")?.toString().trim() || "";

  if (honeypot) {
    setStatus("فشل التحقق من النموذج.", "error");
    return;
  }

  if (!name || !phone || !message) {
    setStatus("من فضلك أكمل جميع الحقول المطلوبة.", "error");
    return;
  }

  if (!validateEgyptPhone(phone)) {
    setStatus("من فضلك أدخل رقم هاتف مصري صحيح.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "جارٍ الإرسال...";
  setStatus("");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      form.reset();
      setStatus("تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.", "success");
    } else {
      const data = await response.json().catch(() => null);

      if (data && data.errors && data.errors.length > 0) {
        setStatus(data.errors[0].message || "حدث خطأ أثناء الإرسال.", "error");
      } else {
        setStatus("تعذر إرسال النموذج الآن. حاول مرة أخرى بعد قليل.", "error");
      }
    }
  } catch (error) {
    setStatus("يوجد خطأ في الاتصال. تحقق من الإنترنت ثم أعد المحاولة.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "إرسال";
  }
});