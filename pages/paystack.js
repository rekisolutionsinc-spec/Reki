document.getElementById("donationForm").addEventListener("submit", function(e) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    var amountGHS = document.getElementById('amount').value;
    
    if (!email || !amountGHS || amountGHS <= 0) {
        alert('Please enter a valid email and amount.');
        return;
    }

    var amountInKobo = amountGHS * 100; // Convert GHS to Kobo (smallest currency unit)

    var handler = PaystackPop.setup({
        key: 'pk_test_b1c07c07844d839c2058859fe73c651b61f684a0', // Your Test Public Key
        email: email,
        amount: amountInKobo,
        currency: 'GHS', // Specify currency as Ghanaian Cedi
        ref: '' + Math.floor(Math.random() * 1000000000 + 1),
        onClose: function(){
            alert('Transaction was not completed, window closed.');
        },
        callback: function(response){
            // Send the reference to backend for verification
            fetch('paystack.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'reference=' + response.reference
            })
            .then(res => res.json())
            .then(data => {
                if(data.success){
                    var msg = document.getElementById("thankYouMessage");
                    msg.style.display = "block";
                    msg.textContent = "Thank you for your donation and support! Payment reference: " + response.reference;
                    document.getElementById("donationForm").reset();
                } else {
                    alert("Payment verification failed: " + data.message);
                }
            })
            .catch(() => {
                alert("Error verifying payment. Please contact support.");
            });
        }
    });

    handler.openIframe();
});
