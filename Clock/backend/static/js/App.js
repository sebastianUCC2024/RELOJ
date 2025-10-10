const timezones = [
  { id: "new-york", timezone: "America/New_York", flag: "🇺🇸", city: "New York", country: "USA", color: "#ff6b9d" },
  {
    id: "los-angeles",
    timezone: "America/Los_Angeles",
    flag: "🇺🇸",
    city: "Los Angeles",
    country: "USA",
    color: "#c084fc",
  },
  { id: "london", timezone: "Europe/London", flag: "🇬🇧", city: "London", country: "UK", color: "#60a5fa" },
  { id: "paris", timezone: "Europe/Paris", flag: "🇫🇷", city: "Paris", country: "France", color: "#34d399" },
  { id: "tokyo", timezone: "Asia/Tokyo", flag: "🇯🇵", city: "Tokyo", country: "Japan", color: "#fbbf24" },
  { id: "dubai", timezone: "Asia/Dubai", flag: "🇦🇪", city: "Dubai", country: "UAE", color: "#f87171" },
  { id: "sydney", timezone: "Australia/Sydney", flag: "🇦🇺", city: "Sydney", country: "Australia", color: "#a78bfa" },
  {
    id: "sao-paulo",
    timezone: "America/Sao_Paulo",
    flag: "🇧🇷",
    city: "São Paulo",
    country: "Brazil",
    color: "#fb923c",
  },
  { id: "shanghai", timezone: "Asia/Shanghai", flag: "🇨🇳", city: "Shanghai", country: "China", color: "#22d3ee" },
]

let timeOffsetHours = 0
let updateInterval = null
let visibleTimezones = []

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme()
  loadCustomTimezones()
  loadVisibleTimezones()
  initializeClocks()
  initializeControls()
  initializeCustomization()
  initializeTimezoneModal()
  initializeManageTimezonesModal()
  updateAllClocks()
  updateInterval = setInterval(updateAllClocks, 1000)
})

function loadCustomTimezones() {
  const customTimezones = JSON.parse(localStorage.getItem("customTimezones") || "[]")
  customTimezones.forEach((tz) => {
    timezones.push(tz)
  })
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("clockTheme") || "midnight"
  document.body.setAttribute("data-theme", savedTheme)
  updateActiveThemeButton(savedTheme)

  const themeButtons = document.querySelectorAll(".theme-btn")
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme")
      if (theme) {
        document.body.setAttribute("data-theme", theme)
        localStorage.setItem("clockTheme", theme)
        updateActiveThemeButton(theme)
      }
    })
  })
}

function updateActiveThemeButton(activeTheme) {
  const themeButtons = document.querySelectorAll(".theme-btn")
  themeButtons.forEach((btn) => {
    if (btn.getAttribute("data-theme") === activeTheme) {
      btn.classList.add("active")
    } else {
      btn.classList.remove("active")
    }
  })
}

function initializeControls() {
  const rewindBtn = document.getElementById("rewindBtn")
  const resetBtn = document.getElementById("resetBtn")
  const forwardBtn = document.getElementById("forwardBtn")

  if (rewindBtn) {
    rewindBtn.addEventListener("click", () => {
      timeOffsetHours -= 1
      updateOffsetDisplay()
      updateAllClocks()
    })
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      timeOffsetHours = 0
      updateOffsetDisplay()
      updateAllClocks()
    })
  }

  if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
      timeOffsetHours += 1
      updateOffsetDisplay()
      updateAllClocks()
    })
  }
}

function updateOffsetDisplay() {
  const display = document.getElementById("timeOffsetDisplay")
  if (!display) return

  if (timeOffsetHours === 0) {
    display.textContent = "Tiempo actual"
    display.className = "time-offset-display"
  } else if (timeOffsetHours > 0) {
    display.textContent = `+${timeOffsetHours} ${Math.abs(timeOffsetHours) === 1 ? "hora" : "horas"}`
    display.className = "time-offset-display offset-forward"
  } else {
    display.textContent = `${timeOffsetHours} ${Math.abs(timeOffsetHours) === 1 ? "hora" : "horas"}`
    display.className = "time-offset-display offset-backward"
  }
}

function initializeClocks() {
  const clocksGrid = document.getElementById("clocksGrid")
  clocksGrid.innerHTML = ""

  timezones.forEach((tz) => {
    if (isTimezoneVisible(tz.id)) {
      const clockCard = createClockCard(tz)
      clocksGrid.appendChild(clockCard)
    }
  })
}

function createClockCard(tz) {
  const card = document.createElement("div")
  card.className = "clock-card"
  card.style.setProperty("--clock-color", tz.color)
  card.id = `clock-${tz.id}`

  const rgb = hexToRgb(tz.color)
  card.style.setProperty("--clock-color-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`)

  card.innerHTML = `
    <div class="clock-header">
      <span class="clock-flag">${tz.flag}</span>
      <div class="clock-location">
        <h3 class="clock-city">${tz.city}</h3>
        <p class="clock-country">${tz.country}</p>
      </div>
    </div>
    
    <div class="analog-clock-wrapper">
      <svg class="analog-clock" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="gradient-${tz.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${tz.color};stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:${tz.color};stop-opacity:0.05" />
          </linearGradient>
        </defs>
        
        <circle cx="100" cy="100" r="95" class="clock-face" fill="url(#gradient-${tz.id})" />
        
        <g class="hour-markers">
          ${generateHourMarkers()}
        </g>
        
        <line x1="100" y1="100" x2="100" y2="50" class="hour-hand" data-hand="hour" />
        <line x1="100" y1="100" x2="100" y2="35" class="minute-hand" data-hand="minute" />
        <line x1="100" y1="100" x2="100" y2="25" class="second-hand" data-hand="second" />
        <circle cx="100" cy="100" r="6" class="center-dot" />
      </svg>
    </div>
    
    <div class="digital-time">
      <span class="time-text" data-time="digital">00:00:00</span>
      <span class="time-period" data-time="period">AM</span>
    </div>
  `

  card.addEventListener("click", () => {
    card.classList.add("pulse")
    setTimeout(() => {
      card.classList.remove("pulse")
    }, 600)
  })

  return card
}

function generateHourMarkers() {
  let markers = ""
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const x1 = 100 + 85 * Math.cos(angle)
    const y1 = 100 + 85 * Math.sin(angle)
    const x2 = 100 + 95 * Math.cos(angle)
    const y2 = 100 + 95 * Math.sin(angle)
    markers += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="hour-marker" />`
  }
  return markers
}

function updateAllClocks() {
  timezones.forEach((tz) => {
    updateClock(tz)
  })
}

function updateClock(tz) {
  const card = document.getElementById(`clock-${tz.id}`)
  if (!card) return

  try {
    const now = new Date()
    const offsetMs = timeOffsetHours * 60 * 60 * 1000
    const adjustedTime = new Date(now.getTime() + offsetMs)

    const timeInZone = new Date(adjustedTime.toLocaleString("en-US", { timeZone: tz.timezone }))

    const hours = timeInZone.getHours()
    const minutes = timeInZone.getMinutes()
    const seconds = timeInZone.getSeconds()

    // Update analog clock hands
    const hourHand = card.querySelector('[data-hand="hour"]')
    const minuteHand = card.querySelector('[data-hand="minute"]')
    const secondHand = card.querySelector('[data-hand="second"]')

    const secondAngle = seconds * 6
    const minuteAngle = minutes * 6 + seconds * 0.1
    const hourAngle = (hours % 12) * 30 + minutes * 0.5

    if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`
    if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`
    if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`

    // Update digital time
    const hour12 = hours % 12 || 12
    const timeText = card.querySelector('[data-time="digital"]')
    const timePeriod = card.querySelector('[data-time="period"]')

    if (timeText) {
      timeText.textContent = `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }
    if (timePeriod) {
      timePeriod.textContent = hours >= 12 ? "PM" : "AM"
    }
  } catch (error) {
    console.error(`Error updating clock for ${tz.city}:`, error)
  }
}

window.addEventListener("beforeunload", () => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

function initializeCustomization() {
  const customizeBtn = document.getElementById("customizeBtn")
  const closeBtn = document.getElementById("closeCustomizeBtn")
  const panel = document.getElementById("customizationPanel")
  const resetBtn = document.getElementById("resetColorsBtn")
  const saveBtn = document.getElementById("saveCustomThemeBtn")

  if (customizeBtn) {
    customizeBtn.addEventListener("click", () => {
      panel.classList.add("active")
      loadCurrentColors()
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      panel.classList.remove("active")
    })
  }

  panel.addEventListener("click", (e) => {
    if (e.target === panel) {
      panel.classList.remove("active")
    }
  })

  const colorInputs = [
    "bgPrimary",
    "bgSecondary",
    "bgTertiary",
    "textPrimary",
    "textSecondary",
    "accentPink",
    "accentPurple",
    "accentBlue",
    "accentCyan",
    "accentGreen",
    "accentYellow",
    "accentOrange",
  ]

  colorInputs.forEach((inputId) => {
    const input = document.getElementById(inputId)
    if (input) {
      input.addEventListener("input", () => {
        applyCustomColors()
      })
    }
  })

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetToDefaultColors()
    })
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveCustomTheme()
    })
  }

  loadSavedThemes()
}

function initializeTimezoneModal() {
  const addTimezoneBtn = document.getElementById("addTimezoneBtn")
  const modal = document.getElementById("timezoneModal")
  const closeBtn = document.getElementById("closeTimezoneModal")
  const saveBtn = document.getElementById("saveTimezoneBtn")

  if (addTimezoneBtn) {
    addTimezoneBtn.addEventListener("click", () => {
      modal.classList.add("active")
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active")
    })
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
    }
  })

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveCustomTimezone()
    })
  }
}

function loadVisibleTimezones() {
  const saved = localStorage.getItem("visibleTimezones")
  if (saved) {
    visibleTimezones = JSON.parse(saved)
  } else {
    // By default, all timezones are visible
    visibleTimezones = timezones.map((tz) => tz.id)
  }
}

function saveVisibleTimezones() {
  localStorage.setItem("visibleTimezones", JSON.stringify(visibleTimezones))
}

function isTimezoneVisible(timezoneId) {
  return visibleTimezones.includes(timezoneId)
}

function saveCustomTimezone() {
  const cityName = document.getElementById("cityName").value.trim()
  const countryName = document.getElementById("countryName").value.trim()
  const timezone = document.getElementById("timezoneSelect").value
  const flagEmoji = document.getElementById("flagEmoji").value.trim() || "🌍"
  const clockColor = document.getElementById("clockColor").value

  if (!cityName || !countryName || !timezone) {
    alert("Por favor completa todos los campos requeridos")
    return
  }

  const newTimezone = {
    id: `custom-${Date.now()}`,
    timezone: timezone,
    flag: flagEmoji,
    city: cityName,
    country: countryName,
    color: clockColor,
  }

  timezones.push(newTimezone)

  visibleTimezones.push(newTimezone.id)
  saveVisibleTimezones()

  // Save to localStorage
  const customTimezones = JSON.parse(localStorage.getItem("customTimezones") || "[]")
  customTimezones.push(newTimezone)
  localStorage.setItem("customTimezones", JSON.stringify(customTimezones))

  // Reinitialize clocks
  initializeClocks()

  // Clear form
  document.getElementById("cityName").value = ""
  document.getElementById("countryName").value = ""
  document.getElementById("timezoneSelect").value = ""
  document.getElementById("flagEmoji").value = ""
  document.getElementById("clockColor").value = "#ff6b9d"

  // Close modal
  document.getElementById("timezoneModal").classList.remove("active")

  alert(`Zona horaria "${cityName}" agregada exitosamente!`)
}

function initializeManageTimezonesModal() {
  const manageBtn = document.getElementById("manageTimezonesBtn")
  const modal = document.getElementById("manageTimezonesModal")
  const closeBtn = document.getElementById("closeManageTimezonesModal")
  const selectAllBtn = document.getElementById("selectAllBtn")
  const deselectAllBtn = document.getElementById("deselectAllBtn")

  if (manageBtn) {
    manageBtn.addEventListener("click", () => {
      modal.classList.add("active")
      renderTimezoneCheckboxes()
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active")
    })
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
    }
  })

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      visibleTimezones = timezones.map((tz) => tz.id)
      saveVisibleTimezones()
      renderTimezoneCheckboxes()
      initializeClocks()
    })
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", () => {
      visibleTimezones = []
      saveVisibleTimezones()
      renderTimezoneCheckboxes()
      initializeClocks()
    })
  }
}

function renderTimezoneCheckboxes() {
  const container = document.getElementById("timezoneCheckboxes")
  if (!container) return

  container.innerHTML = ""

  timezones.forEach((tz) => {
    const item = document.createElement("div")
    item.className = "timezone-checkbox-item"

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.id = `tz-checkbox-${tz.id}`
    checkbox.checked = isTimezoneVisible(tz.id)

    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!visibleTimezones.includes(tz.id)) {
          visibleTimezones.push(tz.id)
        }
      } else {
        visibleTimezones = visibleTimezones.filter((id) => id !== tz.id)
      }
      saveVisibleTimezones()
      initializeClocks()
    })

    const label = document.createElement("label")
    label.className = "timezone-checkbox-label"
    label.htmlFor = `tz-checkbox-${tz.id}`

    label.innerHTML = `
      <span class="timezone-checkbox-flag">${tz.flag}</span>
      <div class="timezone-checkbox-info">
        <div class="timezone-checkbox-city">${tz.city}</div>
        <div class="timezone-checkbox-country">${tz.country}</div>
      </div>
    `

    item.appendChild(checkbox)
    item.appendChild(label)
    container.appendChild(item)
  })
}

function loadCurrentColors() {
  const style = getComputedStyle(document.body)

  document.getElementById("bgPrimary").value = rgbToHex(style.getPropertyValue("--bg-primary").trim())
  document.getElementById("bgSecondary").value = rgbToHex(style.getPropertyValue("--bg-secondary").trim())
  document.getElementById("bgTertiary").value = rgbToHex(style.getPropertyValue("--bg-tertiary").trim())
  document.getElementById("textPrimary").value = rgbToHex(style.getPropertyValue("--text-primary").trim())
  document.getElementById("textSecondary").value = rgbToHex(style.getPropertyValue("--text-secondary").trim())
  document.getElementById("accentPink").value = rgbToHex(style.getPropertyValue("--accent-pink").trim())
  document.getElementById("accentPurple").value = rgbToHex(style.getPropertyValue("--accent-purple").trim())
  document.getElementById("accentBlue").value = rgbToHex(style.getPropertyValue("--accent-blue").trim())
  document.getElementById("accentCyan").value = rgbToHex(style.getPropertyValue("--accent-cyan").trim())
  document.getElementById("accentGreen").value = rgbToHex(style.getPropertyValue("--accent-green").trim())
  document.getElementById("accentYellow").value = rgbToHex(style.getPropertyValue("--accent-yellow").trim())
  document.getElementById("accentOrange").value = rgbToHex(style.getPropertyValue("--accent-orange").trim())
}

function applyCustomColors() {
  const root = document.documentElement

  root.style.setProperty("--bg-primary", document.getElementById("bgPrimary").value)
  root.style.setProperty("--bg-secondary", document.getElementById("bgSecondary").value)
  root.style.setProperty("--bg-tertiary", document.getElementById("bgTertiary").value)
  root.style.setProperty("--text-primary", document.getElementById("textPrimary").value)
  root.style.setProperty("--text-secondary", document.getElementById("textSecondary").value)
  root.style.setProperty("--accent-pink", document.getElementById("accentPink").value)
  root.style.setProperty("--accent-purple", document.getElementById("accentPurple").value)
  root.style.setProperty("--accent-blue", document.getElementById("accentBlue").value)
  root.style.setProperty("--accent-cyan", document.getElementById("accentCyan").value)
  root.style.setProperty("--accent-green", document.getElementById("accentGreen").value)
  root.style.setProperty("--accent-yellow", document.getElementById("accentYellow").value)
  root.style.setProperty("--accent-orange", document.getElementById("accentOrange").value)

  const pink = document.getElementById("accentPink").value
  const purple = document.getElementById("accentPurple").value
  const blue = document.getElementById("accentBlue").value

  root.style.setProperty("--gradient-overlay-1", hexToRgba(pink, 0.15))
  root.style.setProperty("--gradient-overlay-2", hexToRgba(purple, 0.15))
  root.style.setProperty("--gradient-overlay-3", hexToRgba(blue, 0.1))

  document.body.setAttribute("data-theme", "custom")
}

function resetToDefaultColors() {
  const currentTheme = document.body.getAttribute("data-theme")
  if (currentTheme && currentTheme !== "custom") {
    document.body.setAttribute("data-theme", "midnight")
    setTimeout(() => {
      document.body.setAttribute("data-theme", currentTheme)
      loadCurrentColors()
    }, 50)
  } else {
    document.body.setAttribute("data-theme", "midnight")
    loadCurrentColors()
  }
}

function saveCustomTheme() {
  const themeName = prompt("Nombre del tema personalizado:")
  if (!themeName) return

  const customTheme = {
    name: themeName,
    colors: {
      bgPrimary: document.getElementById("bgPrimary").value,
      bgSecondary: document.getElementById("bgSecondary").value,
      bgTertiary: document.getElementById("bgTertiary").value,
      textPrimary: document.getElementById("textPrimary").value,
      textSecondary: document.getElementById("textSecondary").value,
      accentPink: document.getElementById("accentPink").value,
      accentPurple: document.getElementById("accentPurple").value,
      accentBlue: document.getElementById("accentBlue").value,
      accentCyan: document.getElementById("accentCyan").value,
      accentGreen: document.getElementById("accentGreen").value,
      accentYellow: document.getElementById("accentYellow").value,
      accentOrange: document.getElementById("accentOrange").value,
    },
  }

  const savedThemes = JSON.parse(localStorage.getItem("customThemes") || "[]")
  savedThemes.push(customTheme)
  localStorage.setItem("customThemes", JSON.stringify(savedThemes))

  loadSavedThemes()

  alert(`Tema "${themeName}" guardado exitosamente!`)
}

function loadSavedThemes() {
  const savedThemes = JSON.parse(localStorage.getItem("customThemes") || "[]")
  const themesList = document.getElementById("savedThemesList")

  if (!themesList) return

  if (savedThemes.length === 0) {
    themesList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">No hay temas guardados</p>'
    return
  }

  themesList.innerHTML = ""

  savedThemes.forEach((theme, index) => {
    const themeItem = document.createElement("div")
    themeItem.className = "saved-theme-item"

    themeItem.innerHTML = `
      <button class="delete-theme-btn" data-index="${index}">×</button>
      <div class="saved-theme-name">${theme.name}</div>
      <div class="saved-theme-preview">
        <div class="saved-theme-color" style="background: ${theme.colors.bgPrimary}"></div>
        <div class="saved-theme-color" style="background: ${theme.colors.accentPink}"></div>
        <div class="saved-theme-color" style="background: ${theme.colors.accentPurple}"></div>
        <div class="saved-theme-color" style="background: ${theme.colors.accentBlue}"></div>
      </div>
    `

    themeItem.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-theme-btn")) {
        loadCustomTheme(theme)
      }
    })

    const deleteBtn = themeItem.querySelector(".delete-theme-btn")
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      deleteCustomTheme(index)
    })

    themesList.appendChild(themeItem)
  })
}

function loadCustomTheme(theme) {
  const root = document.documentElement

  Object.entries(theme.colors).forEach(([key, value]) => {
    const input = document.getElementById(key)
    if (input) {
      input.value = value
    }

    const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase()
    root.style.setProperty(`--${cssVar}`, value)
  })

  root.style.setProperty("--gradient-overlay-1", hexToRgba(theme.colors.accentPink, 0.15))
  root.style.setProperty("--gradient-overlay-2", hexToRgba(theme.colors.accentPurple, 0.15))
  root.style.setProperty("--gradient-overlay-3", hexToRgba(theme.colors.accentBlue, 0.1))

  document.body.setAttribute("data-theme", "custom")
}

function deleteCustomTheme(index) {
  if (!confirm("¿Estás seguro de eliminar este tema?")) return

  const savedThemes = JSON.parse(localStorage.getItem("customThemes") || "[]")
  savedThemes.splice(index, 1)
  localStorage.setItem("customThemes", JSON.stringify(savedThemes))

  loadSavedThemes()
}

function rgbToHex(rgb) {
  if (rgb.startsWith("#")) return rgb

  const match = rgb.match(/\d+/g)
  if (!match) return "#000000"

  const r = Number.parseInt(match[0])
  const g = Number.parseInt(match[1])
  const b = Number.parseInt(match[2])

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function hexToRgba(hex, alpha) {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 255, g: 107, b: 157 }
}
