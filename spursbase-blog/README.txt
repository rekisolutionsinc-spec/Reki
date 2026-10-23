SPURSBASE BLOG - WHAT GOES WHERE (site root = public_html)

css/css/blog.css      -> replaces your current blog.css
js/blog.js            -> public_html/js/blog.js
blog.html, article.html -> same folder where your blog.html is now (side by side)
admin/                -> public_html/admin/   (the CMS, open yourdomain/admin/)
blog-data/posts.json  -> public_html/blog-data/posts.json
uploads/blog/         -> public_html/uploads/blog/   (images you upload land here)

Folder permissions: admin/data, blog-data, uploads/blog = 755.
Needs PHP 8.0 or newer (cPanel > Select PHP Version).
