// script.js - Final Version for Netlify Deployment

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    // This is the public URL of your live backend on Render.
    // Replace with your own URL after deploying to Render.
    const BASE_URL = 'https://algomind-backend-sg3g.onrender.com';

    // --- STATE & CONFIG ---
    const state = { currentPage: 'home', posts: [], filteredPosts: [], blogCurrentPage: 1, postsPerPage: 6 };

    // --- DOM SELECTORS ---
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const themeToggle = document.getElementById('theme-toggle');
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // --- TEMPLATES ---
    const templates = {
        home: document.getElementById('home-page-template'),
        about: document.getElementById('about-page-template'),
        blog: document.getElementById('blog-page-template'),
        singlePost: document.getElementById('single-post-page-template'),
        contact: document.getElementById('contact-page-template'),
    };

    // --- RENDER FUNCTIONS ---
    const renderPage = () => {
        mainContent.innerHTML = '';
        const [pageId, param] = state.currentPage.split('/');
        let template;

        switch (pageId) {
            case 'home': template = templates.home.content.cloneNode(true); renderHomePage(template); break;
            case 'about': template = templates.about.content.cloneNode(true); renderAboutPage(template); break;
            case 'blog': template = templates.blog.content.cloneNode(true); renderBlogPage(template); break;
            case 'post': template = templates.singlePost.content.cloneNode(true); renderSinglePostPage(template, param); break;
            case 'contact': template = templates.contact.content.cloneNode(true); renderContactPage(template); break;
            default: template = templates.home.content.cloneNode(true); renderHomePage(template);
        }
        mainContent.appendChild(template);
        updateActiveNavLink();
    };

    const renderHomePage = (template) => {
        template.getElementById('hero-name').textContent = config.user.name;
        template.getElementById('hero-tagline').textContent = config.user.tagline;
        template.getElementById('hero-bio').textContent = config.user.shortBio;

        const photoContainer = template.getElementById('hero-photo-container');
        if (config.user.photo) {
            photoContainer.innerHTML = `<img src="${config.user.photo}" alt="${config.user.name}">`;
        }

        const featuredGrid = template.getElementById('featured-posts-grid');
        const featuredPosts = state.posts.filter(p => p.featured).slice(0, 3);
        featuredPosts.forEach(post => featuredGrid.appendChild(createPostCard(post)));
    };
    
    const renderAboutPage = (template) => {
        const photoContainer = template.getElementById('about-photo-container');
        if (config.user.photo) {
            photoContainer.innerHTML = `<img src="${config.user.photo}" alt="${config.user.name}">`;
        }
        template.getElementById('about-bio').innerHTML = config.user.longBio;
        const skillsList = template.getElementById('skills-list');
        config.user.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsList.appendChild(skillTag);
        });
        template.getElementById('resume-link').href = config.user.resumeUrl;
    };

    const renderBlogPage = (template) => {
        const grid = template.getElementById('blog-posts-grid');
        const searchInput = template.getElementById('search-input');
        const categoryFilter = template.getElementById('category-filter');

        const categories = ['All Categories', ...new Set(state.posts.map(p => p.category))];
        categoryFilter.innerHTML = categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('');

        const renderFilteredPosts = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedCategory = categoryFilter.value;
            state.filteredPosts = state.posts
                .filter(p => p.title.toLowerCase().includes(searchTerm) || p.content.toLowerCase().includes(searchTerm))
                .filter(p => selectedCategory === 'all categories' || p.category.toLowerCase() === selectedCategory);
            state.blogCurrentPage = 1;
            renderBlogGrid(grid);
            renderPagination(template.getElementById('pagination-controls'));
        };
        
        searchInput.addEventListener('input', renderFilteredPosts);
        categoryFilter.addEventListener('change', renderFilteredPosts);
        renderFilteredPosts();
    };

    const renderBlogGrid = (grid) => {
        grid.innerHTML = '';
        const startIndex = (state.blogCurrentPage - 1) * state.postsPerPage;
        const paginatedPosts = state.filteredPosts.slice(startIndex, startIndex + state.postsPerPage);
        if (paginatedPosts.length === 0) { grid.innerHTML = '<p>No posts found.</p>'; return; }
        paginatedPosts.forEach(post => grid.appendChild(createPostCard(post)));
    };

    const renderPagination = (container) => {
        container.innerHTML = '';
        const pageCount = Math.ceil(state.filteredPosts.length / state.postsPerPage);
        if (pageCount <= 1) return;
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = (i === state.blogCurrentPage) ? 'active' : '';
            button.addEventListener('click', () => {
                state.blogCurrentPage = i;
                renderBlogGrid(document.getElementById('blog-posts-grid'));
                renderPagination(container);
            });
            container.appendChild(button);
        }
    };

    const renderSinglePostPage = (template, postId) => {
        const post = state.posts.find(p => p._id === postId);
        if (!post) { mainContent.innerHTML = '<p class="container">Post not found.</p>'; return; }
        template.getElementById('post-title').textContent = post.title;
        template.getElementById('post-author').textContent = `By ${post.author}`;
        template.getElementById('post-date').textContent = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        template.getElementById('post-category').textContent = post.category;
        template.getElementById('post-content-full').innerHTML = post.content;
        const imageContainer = template.getElementById('post-image-container');
        if (post.imageUrl) {
            imageContainer.innerHTML = `<img src="${post.imageUrl}" alt="${post.title}">`;
        }
        renderSocialShare(template.getElementById('social-share-buttons'), post);
    };

    const renderContactPage = (template) => {
        const form = template.getElementById('contact-form');
        const feedback = template.getElementById('contact-feedback');
        form.addEventListener('submit', e => {
            e.preventDefault();
            feedback.textContent = "Thank you for your message! I'll get back to you soon.";
            feedback.style.color = 'green';
            form.reset();
        });
    };

    const renderFooter = () => {
        const socialContainer = document.getElementById('footer-social-links');
        const socialMap = {
            linkedin: 'fa-brands fa-linkedin',
            github: 'fa-brands fa-github',
            twitter: 'fa-brands fa-square-x-twitter',
            instagram: 'fa-brands fa-square-instagram'
        };
        socialContainer.innerHTML = Object.keys(config.social)
            .filter(key => config.social[key])
            .map(key => `<a href="${config.social[key]}" target="_blank" rel="noopener noreferrer" aria-label="${key}"><i class="${socialMap[key]}"></i></a>`)
            .join('');
    };

    const createPostCard = (post) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <a href="#post/${post._id}" class="post-card-link">
                <div class="post-card-image">
                    <img src="${post.imageUrl || 'https://placehold.co/600x400/E5E7EB/4B5563?text=No+Image'}" alt="${post.title}" onerror="this.src='https://placehold.co/600x400/E5E7EB/4B5563?text=No+Image';">
                </div>
                <div class="post-card-content">
                    <span class="post-category">${post.category}</span>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <div class="post-card-meta">
                        <span>By ${post.author}</span>
                        <span>${new Date(post.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </a>
        `;
        return card;
    };

    const updateActiveNavLink = () => {
        const [pageId] = state.currentPage.split('/');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === pageId) {
                link.classList.add('active');
            }
        });
    };

    const renderSocialShare = (container, post) => {
        const shareText = encodeURIComponent(`${post.title} by ${post.author}`);
        const shareUrl = encodeURIComponent(window.location.href);
        const shareButtons = [
            { icon: 'fa-brands fa-facebook-f', href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
            { icon: 'fa-brands fa-square-x-twitter', href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` },
            { icon: 'fa-brands fa-linkedin-in', href: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}` },
            { icon: 'fa-solid fa-copy', href: `#`, action: 'copy' }
        ];
        container.innerHTML = shareButtons.map(btn => {
            return `<a href="${btn.href}" ${btn.action !== 'copy' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="share-btn" data-action="${btn.action || ''}"><i class="${btn.icon}"></i></a>`;
        }).join('');

        container.querySelectorAll('.share-btn[data-action="copy"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tempInput = document.createElement('input');
                tempInput.value = window.location.href;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => { btn.innerHTML = originalIcon; }, 2000);
            });
        });
    };

    // --- DATA FETCHING ---
    const loadPosts = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/posts`);
            if (!response.ok) throw new Error('Network response was not ok');
            state.posts = await response.json();
            renderPage();
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            mainContent.innerHTML = `<p class="container" style="text-align:center; padding: 4rem 0;">Error loading blog posts. Please ensure the backend server is running and refresh the page.</p>`;
        }
    };

    // --- INITIALIZATION ---
    const init = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        themeToggle.checked = savedTheme === 'dark';
        
        renderFooter();
        
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        document.body.addEventListener('click', e => {
            if (e.target.closest('.nav-link')) {
                navLinksContainer.classList.remove('active');
                window.location.hash = e.target.closest('.nav-link').getAttribute('href');
            }
             if (e.target.closest('.post-card-link')) {
                e.preventDefault();
                window.location.hash = e.target.closest('.post-card-link').getAttribute('href');
            }
        });
        mobileNavToggle.addEventListener('click', () => navLinksContainer.classList.toggle('active'));
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.toggle('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
        });

        loadPosts();
        navigate(window.location.hash || '#home');
    };

    const navigate = (hash) => {
        const [page, param] = hash.substring(1).split('/');
        state.currentPage = param ? `${page}/${param}` : page;
        renderPage();
    };

    init();
});
