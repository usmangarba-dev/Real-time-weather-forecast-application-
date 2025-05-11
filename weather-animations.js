// Weather animation mappings
const weatherAnimations = {
    "01d": "clear-day",
    "01n": "clear-night",
    "02d": "partly-cloudy-day",
    "02n": "partly-cloudy-night",
    "03d": "cloudy",
    "03n": "cloudy",
    "04d": "cloudy",
    "04n": "cloudy",
    "09d": "rain",
    "09n": "rain",
    "10d": "rain",
    "10n": "rain",
    "11d": "thunderstorm",
    "11n": "thunderstorm",
    "13d": "snow",
    "13n": "snow",
    "50d": "fog",
    "50n": "fog"
};

// Animation JSON files
const animationFiles = {
    "clear-day": "https://assets5.lottiefiles.com/temp/lf20_Stdaec.json",
    "clear-night": "https://assets9.lottiefiles.com/packages/lf20_ysrn2iwp.json",
    "partly-cloudy-day": "https://assets5.lottiefiles.com/packages/lf20_KUFdS6.json",
    "partly-cloudy-night": "https://assets5.lottiefiles.com/packages/lf20_xRmNN8.json",
    "cloudy": "https://assets9.lottiefiles.com/packages/lf20_trr3kzyu.json",
    "rain": "https://assets7.lottiefiles.com/packages/lf20_bco9p3ju.json",
    "thunderstorm": "https://assets7.lottiefiles.com/private_files/lf30_LPtaP2.json",
    "snow": "https://assets3.lottiefiles.com/packages/lf20_jz1lh9i.json",
    "fog": "https://assets3.lottiefiles.com/packages/lf20_keiuxo5u.json"
};

// Function to load weather animation
function loadWeatherAnimation(container, iconCode, size = 80) {
    if (!container) return;
    
    // Clear any existing animations
    container.innerHTML = '';
    
    // Get animation type based on icon code
    const animationType = weatherAnimations[iconCode] || "cloudy";
    const animationPath = animationFiles[animationType];
    
    // Set container size
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;
    
    // Load animation
    lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
    });
}