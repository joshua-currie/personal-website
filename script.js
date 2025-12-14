// =============================================================================
// DEVELOPMENT OVERRIDES - to test different scenarios
// =============================================================================
const DEV_OVERRIDE = {
    enabled: false,  // set to true to enable overrides
    hour: 18,        // 0-23 (19 = 7 PM)
    minute: 30,      // 0-59
    dayOfWeek: 1,    // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    isRaining: false, // true or false
    temperature: 72, // in Fahrenheit
    // Sunset time in format "2025-12-11T17:45:00-05:00"
    sunset: "2025-12-11T18:45:00-05:00"
};
// =============================================================================

// background selection
function getBackgroundClass(weatherData) 
{
    const { hour, minute, is_raining, sunrise, sunset } = weatherData;
    
    // parse sunset time
    const sunsetTime = new Date(sunset);
    const sunsetHour = sunsetTime.getHours();
    const sunsetMinute = sunsetTime.getMinutes();
    
    const currentTimeInMinutes = hour * 60 + minute;
    const sunsetTimeInMinutes = sunsetHour * 60 + sunsetMinute;
    
    // 30 minutes before sunset
    const thirtyMinutesBeforeSunset = sunsetTimeInMinutes - 30;
    // 29 minutes before sunset to 29 minutes after sunset
    const twentyNineMinutesBeforeSunset = sunsetTimeInMinutes - 29;
    const twentyNineMinutesAfterSunset = sunsetTimeInMinutes + 29;
    // 30 minutes after sunset
    const thirtyMinutesAfterSunset = sunsetTimeInMinutes + 30;
    
    // morning (5 AM - 11:59 AM)
    if (hour >= 5 && hour < 12) 
    {
        return { class: is_raining ? 'bg-2' : 'bg-1', period: 'Morning' };
    }
    
    // noon/afternoon (12 PM - evening but before 30 min before sunset)
    if (hour >= 12 && currentTimeInMinutes < thirtyMinutesBeforeSunset) 
    {
        let period;
        if (hour === 12) 
        {
            period = 'Noon';
        }
        
        else if (hour >= 16) 
        {
            period = 'Evening';
        } 
        
        else 
        {
            period = 'Afternoon';
        }

        return { class: is_raining ? 'bg-4' : 'bg-3', period };
    }
    
    // evening but 30 minutes before sunset (until 29 minutes before sunset)
    if (currentTimeInMinutes >= thirtyMinutesBeforeSunset && currentTimeInMinutes < twentyNineMinutesBeforeSunset) 
    {
        return { class: is_raining ? 'bg-6' : 'bg-5', period: 'Evening (Before Sunset)' };
    }
    
    // 29 minutes before or after sunset
    if (currentTimeInMinutes >= twentyNineMinutesBeforeSunset && currentTimeInMinutes <= twentyNineMinutesAfterSunset) 
    {
        return { class: is_raining ? 'bg-8' : 'bg-7', period: 'Around Sunset' };
    }
    
    // 30 minutes after sunset but before 11pm
    if (currentTimeInMinutes > twentyNineMinutesAfterSunset && hour < 23) 
    {
        return { class: is_raining ? 'bg-10' : 'bg-9', period: 'Evening' };
    }
    
    // after 11pm but not morning yet (11pm - 4:59 AM)
    if (hour >= 23 || hour < 5) 
    {
        return { class: is_raining ? 'bg-12' : 'bg-11', period: 'Night' };
    }
    
    // default fallback
    return { class: 'bg-1', period: 'Morning' };
}

// update background based on weather
function updateBackground(weatherData) 
{
    const backgroundContainer = document.getElementById('background-container');
    const result = getBackgroundClass(weatherData);
    
    backgroundContainer.className = 'background-container';
    backgroundContainer.classList.add(result.class);
    
    console.log('Background updated:', result.class, weatherData);
    
    // return for tooltip
    return result.period;
}

// update tooltip info
function updateTooltip(weatherData, timePeriod) 
{
    try 
    {
        const currentTime = new Date(weatherData.current_time);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // format time as 12-hour with AM/PM
        let hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const timeStr = `${hours}:${minutesStr} ${ampm}`;
        
        document.getElementById('day-of-week').textContent = daysOfWeek[currentTime.getDay()];
        document.getElementById('current-time').textContent = timeStr;
        document.getElementById('time-period').textContent = timePeriod;
        document.getElementById('weather-condition').textContent = weatherData.is_raining ? '🌧️ Rainy' : '☀️ Clear';
        document.getElementById('temp-display').textContent = `${Math.round(weatherData.temperature)}°F`;
        
        console.log('Tooltip updated successfully');
    } 
    
    catch (error) 
    {
        console.error('Error updating tooltip:', error);
    }
}

// get activity based on time and day
function getActivity(weatherData, timePeriod) 
{
    const currentTime = new Date(weatherData.current_time);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[currentTime.getDay()];
    const hour = weatherData.hour;
    const isWeekday = currentTime.getDay() >= 1 && currentTime.getDay() <= 5;
    const isRaining = weatherData.is_raining;
    
    // special case for sunset with rain
    if (timePeriod === 'Around Sunset' && isRaining) 
    {
        return `It's ${dayOfWeek} around Sunset. If it wasn't raining I would be watching the sunset.`;
    }
    
    let activity = '';
    
    // determine activity based on time and weekday/weekend
    if (timePeriod === 'Around Sunset') 
    {
        activity = 'watching the sunset';
    } 

    else if (hour >= 7 && hour < 10)
    {
        activity = isWeekday ? 'going to work' : 'still asleep';
    } 

    else if (hour >= 10 && hour < 16) 
    {
        activity = isWeekday ? 'at work' : 'out for lunch somewhere';
    } 

    else if (hour >= 16 && hour < 18) 
    {
        activity = isWeekday ? 'coming home from work' : 'out somewhere';
    } 

    else if (hour >= 18 && hour < 20) 
    {
        activity = 'out somewhere';
    } 
    
    else if (hour >= 20 && hour < 23) 
    {
        activity = 'playing video games';
    }

    else if (hour >= 23 || hour < 7) 
    {
        activity = 'asleep';
    } 
    
    else {
        activity = 'doing something';
    }
    
    return `It's ${dayOfWeek} ${timePeriod}. I am probably ${activity}.`;
}

// update activity message
function updateActivityMessage(weatherData, timePeriod) 
{
    try 
    {
        const activityText = getActivity(weatherData, timePeriod);
        const activityElement = document.getElementById('activity-message');
        activityElement.textContent = activityText;
        
        // show person image
        const personImage = document.getElementById('person-image');
        if (activityText.includes('going to work')) 
        {
            personImage.src = 'person/person5.png';
            personImage.classList.add('visible');
        } 

        else if (activityText.includes('coming home from work')) 
        {
            personImage.src = 'person/person-4.png';
            personImage.classList.add('visible');
        } 
        
        else if (activityText.includes('watching the sunset') && !weatherData.is_raining) 
        {
            personImage.src = 'person/person-3.png';
            personImage.classList.add('visible');
        } 
        
        else 
        {
            personImage.classList.remove('visible');
            personImage.src = '';
        }
        
        console.log('Activity message updated:', activityText);
    } 
    
    catch (error) 
    {
        console.error('Error updating activity message:', error);
    }
}

// fetch weather data from API
async function fetchWeatherData() 
{
    try 
    {
        const response = await fetch('/api/weather');
        
        if (!response.ok) 
        {
            throw new Error('Failed to fetch weather data');
        }
        
        let data = await response.json();
        
        // apply development overrides if enabled
        if (DEV_OVERRIDE.enabled) 
        {
            console.log('⚠️ DEVELOPMENT MODE: Applying overrides');
            const overrideTime = new Date(data.current_time);
            overrideTime.setHours(DEV_OVERRIDE.hour);
            overrideTime.setMinutes(DEV_OVERRIDE.minute);
            
            // Override day of week
            const currentDay = overrideTime.getDay();
            const dayDiff = DEV_OVERRIDE.dayOfWeek - currentDay;
            overrideTime.setDate(overrideTime.getDate() + dayDiff);
            
            data = {
                ...data,
                current_time: overrideTime.toISOString(),
                hour: DEV_OVERRIDE.hour,
                minute: DEV_OVERRIDE.minute,
                is_raining: DEV_OVERRIDE.isRaining,
                temperature: DEV_OVERRIDE.temperature,
                sunset: DEV_OVERRIDE.sunset
            };
            console.log('Override data:', data);
        }
        
        const timePeriod = updateBackground(data);
        updateTooltip(data, timePeriod);
        
        // wait 2 seconds before showing activity message
        setTimeout(() => {
            updateActivityMessage(data, timePeriod);
        }, 2000);
        
    } 
    
    catch (error) 
    {
        console.error('Error fetching weather data:', error);
        const backgroundContainer = document.getElementById('background-container');
        backgroundContainer.className = 'background-container bg-1';
        console.log('Applied fallback background: bg-1');
    }
}

function init() 
{
    fetchWeatherData();
    setInterval(fetchWeatherData, 5 * 60 * 1000);
    
    // mobile touch handling for info icon
    const infoIcon = document.getElementById('info-icon');
    const infoTooltip = document.getElementById('info-tooltip');
    
    if (infoIcon && infoTooltip) 
    {
        // toggle tooltip on touch devices
        infoIcon.addEventListener('click', function(e) 
        {
            e.stopPropagation();
            infoIcon.classList.toggle('active');
        });
        
        // close tooltip when clicking outside
        document.addEventListener('click', function(e) 
        {
            if (!infoIcon.contains(e.target) && !infoTooltip.contains(e.target)) 
            {
                infoIcon.classList.remove('active');
            }
        });
        
        // prevent tooltip clicks from closing it
        infoTooltip.addEventListener('click', function(e) 
        {
            e.stopPropagation();
        });
    }
}

// start when page loads
if (document.readyState === 'loading') 
{
    document.addEventListener('DOMContentLoaded', init);
} 

else 
{
    init();
}
