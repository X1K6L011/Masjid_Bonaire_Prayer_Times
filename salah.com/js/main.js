$(function () {

    $('img').click(function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(displayLocationInfo);
        }

        function displayLocationInfo(position) {
            const lng = position.coords.longitude;
            const lat = position.coords.latitude;

            $('img').attr('src', '/img/loading.svg');

            $.getJSON('/get?lg=' + lng + '&lt=' + lat, function (data) {
                $('img').attr('src', '/img/geo.svg');

                $('span', 'h2').text(data.location);
                $('#Fajr').html('<span>' + data.times.Fajr.replace(' ', '</span>'));
                $('#Sunrise').html('<span>' + data.times.Sunrise.replace(' ', '</span>'));
                $('#Dhuhr').html('<span>' + data.times.Dhuhr.replace(' ', '</span>'));
                $('#Asr').html('<span>' + data.times.Asr.replace(' ', '</span>'));
                $('#Maghrib').html('<span>' + data.times.Maghrib.replace(' ', '</span>'));
                $('#Isha').html('<span>' + data.times.Isha.replace(' ', '</span>'));
                $('#Qiyam').html('<span>' + data.times.Qiyam.replace(' ', '</span>'));
            });
        }
    });
});

/* --- THE TIME-TURNING SCRIPT --- */
function updatePrayerApp() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    const rows = document.querySelectorAll('#prayer-times tbody tr');
    let activeIndex = -1;
    let nextPrayerTimeInMinutes = null;

    rows.forEach((row, index) => {
        row.classList.remove('is-active');
        const timeText = row.querySelector('.adhaan-time').innerText.trim();
        let [hours, minutes] = timeText.split(':').map(Number);

        // Simple 12h to 24h correction for afternoon prayers
        if (index >= 1 && hours < 12) hours += 12;
        const prayerMinutes = hours * 60 + minutes;

        if (currentMinutes >= prayerMinutes) {
            activeIndex = index;
        } else if (nextPrayerTimeInMinutes === null) {
            nextPrayerTimeInMinutes = prayerMinutes;
        }
    });

    if (activeIndex !== -1) rows[activeIndex].classList.add('is-active');

    // Countdown Calculation
    let diffSeconds;
    if (nextPrayerTimeInMinutes !== null) {
        diffSeconds = ((nextPrayerTimeInMinutes - currentMinutes) * 60) - currentSeconds;
    } else {
        // If after Isha, calculate time until Fajr (first row) tomorrow
        const firstRowTime = rows[0].querySelector('.adhaan-time').innerText.trim();
        let [fH, fM] = firstRowTime.split(':').map(Number);
        diffSeconds = (((1440 - currentMinutes) + (fH * 60 + fM)) * 60) - currentSeconds;
    }

    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;

    document.getElementById('countdown').innerText =
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

setInterval(updatePrayerApp, 1000);
updatePrayerApp();