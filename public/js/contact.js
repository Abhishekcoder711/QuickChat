document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("successMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // page reload रोकना

    const formData = new FormData(form);

    try {
      const res = await fetch("/contact", {
        method: "POST",
        body: new URLSearchParams(formData)
      });

      const data = await res.text();

      successMsg.innerText = data;
      successMsg.style.color = "green";

      form.reset(); // form clear

    } catch (err) {
      successMsg.innerText = "❌ Something went wrong";
      successMsg.style.color = "red";
    }
  });

});