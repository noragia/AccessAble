// OWN THE ROOM page: video, booking calendar and the mobile booking bar.
// Settings live in own-the-room.config.js — nothing in here needs editing.
(function () {
  var cfg = window.OWN_THE_ROOM || {};
  var videoUrl = (cfg.videoUrl || '').trim();
  var calUrl = (cfg.calendlyUrl || '').trim();

  /* ── video ───────────────────────────────────────────── */
  var frame = document.getElementById('otr-video');
  if (frame) {
    if (cfg.videoShape === 'vertical') frame.classList.add('is-vertical');
    var poster = cfg.videoPoster || '';
    var embed = toEmbed(videoUrl);

    if (!videoUrl) {
      frame.classList.add('is-empty');
    } else if (embed) {
      // Show a cover with a play button; the player only loads when pressed.
      var cover = embed.thumb || poster;
      frame.innerHTML =
        (cover ? '<img src="' + esc(cover) + '" alt="" loading="eager" decoding="async">' : '') +
        '<button type="button" class="otr-play"><span class="otr-play-icon" aria-hidden="true"></span><span>Watch the video</span></button>';
      frame.querySelector('button').addEventListener('click', function () {
        frame.innerHTML = '<iframe src="' + esc(embed.src) + '" title="A message from Nora about OWN THE ROOM" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>';
        frame.classList.add('is-playing');
      });
    } else {
      frame.innerHTML = '<video controls playsinline preload="none"' + (poster ? ' poster="' + esc(poster) + '"' : '') + '>' +
        '<source src="' + esc(videoUrl) + '"></video>';
      frame.classList.add('is-playing');
    }
  }

  function toEmbed(url) {
    var m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)))
      return { src: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0&modestbranding=1&playsinline=1',
               thumb: 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg' };
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/)))
      return { src: 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1' + (m[2] ? '&h=' + m[2] : '') };
    if ((m = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/)))
      return { src: 'https://www.loom.com/embed/' + m[1] + '?autoplay=1' };
    return null;
  }
  function esc(s) { return String(s).replace(/[&"<>]/g, function (c) { return { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* ── booking calendar ────────────────────────────────── */
  var cal = document.getElementById('otr-calendar');
  if (cal) {
    if (!calUrl) {
      cal.classList.add('is-empty');
    } else {
      cal.querySelector('.otr-cal-fallback').hidden = true;
      var loaded = false;
      var load = function () {
        if (loaded) return; loaded = true;
        var sep = calUrl.indexOf('?') > -1 ? '&' : '?';
        var box = document.createElement('div');
        box.className = 'calendly-inline-widget';
        box.setAttribute('data-url', calUrl + sep + 'hide_gdpr_banner=1&background_color=fcfbf8&text_color=1d2b4c&primary_color=1d2b4c');
        cal.appendChild(box);
        var s = document.createElement('script');
        s.src = 'https://assets.calendly.com/assets/external/widget.js';
        s.async = true;
        cal.appendChild(s);
      };
      // Load the calendar just before it scrolls into view, or right away if someone taps a booking button.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '900px 0px' });
        io.observe(cal);
      } else { load(); }
      document.querySelectorAll('a[href="#book"]').forEach(function (a) { a.addEventListener('click', load); });
      if (location.hash === '#book') load();
    }
  }

  /* ── rotating word ──────────────────────────────────── */
  var rot = document.querySelector('.o-rotator');
  if (rot && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var words = rot.querySelectorAll('span'), i = 0;
    setInterval(function () {
      var cur = words[i]; i = (i + 1) % words.length;
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      words[i].classList.remove('is-out'); words[i].classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-out'); }, 500);
    }, 1900);
  }

  /* ── mobile booking bar ──────────────────────────────── */
  // Appears once the hero's booking button has scrolled away; hides again at the booking section.
  var bar = document.getElementById('otr-bar');
  var heroCta = document.getElementById('otr-hero-cta');
  var book = document.getElementById('book');
  if (bar && heroCta && book && 'IntersectionObserver' in window) {
    var pastHero = false, atBooking = false;
    var update = function () { bar.classList.toggle('is-on', pastHero && !atBooking); };
    new IntersectionObserver(function (e) {
      pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; update();
    }).observe(heroCta);
    new IntersectionObserver(function (e) {
      atBooking = e[0].isIntersecting || e[0].boundingClientRect.top < 0; update();
    }, { rootMargin: '0px 0px -20% 0px' }).observe(book);
  }
})();
