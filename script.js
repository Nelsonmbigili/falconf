document.addEventListener("DOMContentLoaded", () => {
  
  /* ========================================
     0. HAMBURGER MENU TOGGLE
     ======================================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on a link
    const menuLinks = navLinks.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  
  /* ========================================
     1. SCROLL REVEAL OBSERVER
     ======================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Trigger child animations when section becomes active
        const animatedElements = entry.target.querySelectorAll(
          '.fade-in-left, .fade-in-right, .fade-in-up, .fade-in, .slide-in-down, .scale-in'
        );
        
        animatedElements.forEach((el, index) => {
          setTimeout(() => {
            el.style.animationPlayState = 'running';
          }, index * 100);
        });
      }
    });
  }, { 
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });


  // Observe all reveal sections
  document.querySelectorAll('.reveal-section').forEach(section => {
    revealObserver.observe(section);
  });

  /* ========================================
     2. NAV SCROLL SPY & BALL COLOR LOGIC
     ======================================== */
  const navBall = document.getElementById("nav-ball");
  const navMenuLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section");
  const navbar = document.querySelector('.navbar');

  window.addEventListener("scroll", () => {
    let currentId = "";
    const scrollPosition = window.scrollY;
    
    // Update active section
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute("id");
      }
    });

    // Update active nav link
    navMenuLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + currentId) {
        link.classList.add("active");
      }
    });

    // Switch ball icon color based on section
    if (navBall) {
      if (currentId === "home" || scrollPosition < 100) {
        navBall.src = "assets/black-ball.svg";
      } else {
        navBall.src = "assets/ball.svg";
      }
    }

    // Add shadow to navbar on scroll
    if (navbar) {
      if (scrollPosition > 100) {
        navbar.style.boxShadow = "0 4px 30px rgba(0,0,0,0.12)";
      } else {
        navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.08)";
      }
    }
  });

  /* ========================================
     3. SMOOTH SCROLL FOR NAVIGATION LINKS
     ======================================== */
  navMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
/* ========================================
   RENDER TEAMS WITH SCROLL ARROWS
   ======================================== */
const teamsContainer = document.getElementById("teams-container");
const teamsScroll = document.getElementById("teams-scroll");
const scrollLeft = document.getElementById("scroll-left");
const scrollRight = document.getElementById("scroll-right");
const teamModal = document.getElementById("team-modal");

if (teamsContainer && window.teams) {
  // Render team cards
  window.teams.forEach((team, index) => {
    const card = document.createElement("div");
    card.className = "team-card";
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
      <img src="${team.image}" class="card-avatar" alt="${team.name}">
      <h3>${team.name}</h3>
      <span class="badge">${team.division}</span>
    `;
    
    card.onclick = () => openTeamModal(team);
    teamsContainer.appendChild(card);
  });

  // Scroll arrow functionality
  if (scrollLeft && scrollRight && teamsScroll) {
    const updateArrows = () => {
      const { scrollLeft: left, scrollWidth, clientWidth } = teamsScroll;
      scrollLeft.disabled = left <= 0;
      scrollRight.disabled = left + clientWidth >= scrollWidth - 1;
    };

    scrollLeft.addEventListener("click", () => {
      teamsScroll.scrollBy({ left: -300, behavior: "smooth" });
    });

    scrollRight.addEventListener("click", () => {
      teamsScroll.scrollBy({ left: 300, behavior: "smooth" });
    });

    teamsScroll.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }
}

// Open team modal (keep your existing modal)
function openTeamModal(team) {
  document.getElementById("modal-team-img").src = team.image;
  document.getElementById("modal-team-name").innerText = team.name;
  document.getElementById("modal-team-div").innerText = team.division;
  document.getElementById("modal-team-desc").innerText = team.description || "No description provided.";
  
  const stats = team.stats || { wins: 0, losses: 0, goals: 0 };
  document.getElementById("modal-stats-wins").innerText = stats.wins;
  document.getElementById("modal-stats-losses").innerText = stats.losses;
  document.getElementById("modal-stats-goals").innerText = stats.goals;
  
  teamModal.showModal();
}
  /* ========================================
     5. RENDER FIXTURES WITH CAROUSEL (2 DATES AT A TIME)
     ======================================== */
  let currentFixPage = 0;
  const DATES_PER_PAGE = 2;

  function getTeamImg(name) {
    const team = window.teams.find(t => t.name === name);
    return team ? team.image : './assets/default-logo.jpg'; 
  }

  function renderFixtures() {
    const target = document.getElementById('fixtures-body');
    if (!window.fixtures || !target) return;

    // Group by date
    const groups = window.fixtures.reduce((acc, m) => {
      (acc[m.date] = acc[m.date] || []).push(m);
      return acc;
    }, {});

    const dates = Object.keys(groups);
    const totalPages = Math.ceil(dates.length / DATES_PER_PAGE);
    const activeDates = dates.slice(currentFixPage * DATES_PER_PAGE, (currentFixPage + 1) * DATES_PER_PAGE);

    target.innerHTML = `
      <div class="fixtures-container">
        <div class="fixtures-nav">
          <button class="nav-btn" onclick="movePage(-1)" ${currentFixPage === 0 ? 'disabled' : ''}>‹</button>
          <span style="font-size: 0.8rem; font-weight: 600;">${activeDates[0]} - ${activeDates[activeDates.length-1]}</span>
          <button class="nav-btn" onclick="movePage(1)" ${currentFixPage >= totalPages - 1 ? 'disabled' : ''}>›</button>
        </div>

        <div class="fixtures-list">
          ${activeDates.map(date => `
            <div class="day-header">${date}</div>
            ${groups[date].map(m => {
              // Look up logos dynamically
              const homeImg = getTeamImg(m.homeTeam);
              const awayImg = getTeamImg(m.awayTeam);
              
              return `
                <div class="fix-row">
                  <div class="team home">
                    ${m.homeTeam} 
                    <img src="${homeImg}" class="team-img" alt="${m.homeTeam}">
                  </div>
                  
                  <div class="score-box">
                    ${m.status === 'FT' 
                      ? `${m.homeScore} : ${m.awayScore}` 
                      : `<span class="time-txt">${m.time}</span>`}
                  </div>
                  
                  <div class="team away">
                    <img src="${awayImg}" class="team-img" alt="${m.awayTeam}">
                    ${m.awayTeam}
                  </div>
                </div>
              `;
            }).join('')}
          `).join('')}
        </div>
      </div>
    `;
      }

  window.movePage = (step) => {
    currentFixPage += step;
    renderFixtures();
  };

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFixtures);
  } else {
    renderFixtures();
  }

    /* ========================================
       6. BACK TO TOP BUTTON
       ======================================== */
    const topBtn = document.getElementById("back-to-top");
    
    if (topBtn) {
      // Show/hide button based on scroll position
      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
          topBtn.classList.add('show');
        } else {
          topBtn.classList.remove('show');
        }
      });
      
      // Scroll to top on click
      topBtn.onclick = () => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      };
    }

  /* ========================================
     7. MODAL INTERACTIONS
     ======================================== */
  if (teamModal) {
    // Close modal when clicking on backdrop
    teamModal.addEventListener("click", (e) => {
      const rect = teamModal.getBoundingClientRect();
      if (
        e.clientX < rect.left || 
        e.clientX > rect.right || 
        e.clientY < rect.top || 
        e.clientY > rect.bottom
      ) {
        teamModal.close();
      }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && teamModal.open) {
        teamModal.close();
      }
    });
  }
/* ========================================
   8. FORM SUBMISSION HANDLER 
   ======================================== */
    const registrationForm = document.querySelector('.styled-form');

    if (registrationForm) {
      registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = registrationForm.querySelector('button');
        
        // 1. UI Loading State
        submitBtn.disabled = true;
        submitBtn.innerText = "SENDING...";

        // 2. Prepare Data
        const formData = new FormData(registrationForm);

        try {
          // 3. Send to Formspree/Getform
          const response = await fetch(registrationForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            // 4. Show a Minimal Toast
            showToast("Message Sent Successfully");
            registrationForm.reset();
          } else {
            showToast("Error sending message", true);
          }
        } catch (error) {
          showToast("Connection failed", true);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = "SEND MESSAGE";
        }
      });
    }

    function showToast(text, isError = false) {
      const statusMessage = document.createElement('div');
      statusMessage.className = 'form-success-toast';
      if(isError) statusMessage.style.background = '#b71540'; 

      statusMessage.innerHTML = `
        <div class="toast-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <strong>${text}</strong>
        </div>
      `;
      document.body.appendChild(statusMessage);
      setTimeout(() => statusMessage.classList.add('show'), 10);
      setTimeout(() => {
        statusMessage.classList.remove('show');
        setTimeout(() => statusMessage.remove(), 500);
      }, 4000);
    }

});