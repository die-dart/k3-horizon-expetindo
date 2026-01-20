// Form submission handler with Local API
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);

    // Map form fields to JSON payload
    const registrationData = {
        full_name: formData.get('fullName'),
        email: formData.get('email'),
        phone_number: parseInt(formData.get('phone'), 10),
        company: formData.get('company') || null,
        training_program: formData.get('program'),
        note: formData.get('message') || null
    };

    try {
        // Send data to Local API
        const response = await fetch('https://horizonexpert.id/apiformRegisters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Terjadi kesalahan saat mengirim pendaftaran');
        }

        console.log('Form submitted successfully:', result);
        alert('Terima kasih! Pendaftaran Anda telah diterima. Tim kami akan segera menghubungi Anda.');
        this.reset();

    } catch (err) {
        console.error('Error submitting form:', err);
        alert('Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami melalui WhatsApp.');
    }
});
