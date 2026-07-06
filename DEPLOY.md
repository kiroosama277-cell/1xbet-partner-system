# ==========================================
# 1XBET Partner App - Deployment Guide
# ==========================================

## الطريقة 1: Vercel + Supabase (مجاني - الأسهل)

### 1. اشتري دومين .com
- روح namecheap.com أو cloudflare.com
- ابحث عن دومين مثل: 1xbet-partners.com أو promo1xbet.com
- اشتريه (~9$/سنة)

### 2. اعمل حساب Supabase (قاعدة بيانات مجانية)
- روح supabase.com وسجّل
- اعمل مشروع جديد
- من Settings → Database → Connection string
- انسخ الرابط (استبدال [password] بكلمة السر)

### 3. ارفع الكود على GitHub
```bash
git init
git add .
git commit -m "1XBET Partner App"
# اعمل ريبو على github.com ثم:
git remote add origin https://github.com/USERNAME/1xbet-app.git
git push -u origin main
```

### 4. انشر على Vercel
- روح vercel.com وسجّل بـ GitHub
- New Project → اختار الريبو
- Environment Variables:
  - DATABASE_URL = الرابط من Supabase
- Deploy

### 5. ربط الدومين
- في Vercel Dashboard → Settings → Domains
- أضف دومينك: yourdomain.com
- في Namecheap/Cloudflare DNS:
  - Type: CNAME  Name: www  Value: cname.vercel-dns.com
  - Type: A      Name: @    Value: 76.76.21.21

### 6. أنشئ الأدمن
- بعد النشر، شغّل في Vercel Terminal:
  npx prisma db seed
- أو من Supabase SQL Editor:
  INSERT INTO "Admin" (id, username, "accessCode", "createdAt")
  VALUES ('admin1', 'superadmin', '17F6413A', NOW());

## بيانات الدخول
- اسم المستخدم: superadmin
- كود الدخول: 17F6413A
- لوحة التحكم: https://yourdomain.com/admin

## ==========================================
## الطريقة 2: VPS (أقوى - 5$/شهر)
## ==========================================

### 1. اشتري VPS من hetzner.com (3.5€/شهر)
### 2. اشتري دومين ووجّه DNS للسيرفر IP
### 3. على السيرفر:

```bash
# ثبّت Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx

# ارفع المشروع
cd /var/www
# scp 1xbet-pro-final.zip root@IP:/var/www/
unzip 1xbet-pro-final.zip -d 1xbet
cd 1xbet

# غيّر DATABASE_URL في .env لـ PostgreSQL
# أو استخدم SQLite محلياً
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build

# شغّل بـ PM2
npm install -g pm2
pm2 start npm --name "1xbet" -- start
pm2 save && pm2 startup

# إعداد Nginx
cat > /etc/nginx/sites-available/1xbet << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
ln -s /etc/nginx/sites-available/1xbet /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# إضافة HTTPS
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
