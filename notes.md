git branch
git merge feature/vite-migration

git add .
git commit -m 
git push
-------------------------------------
git checkout feature/vite-migration  -> cambiar de rama

-------------------------------------
admin global
admingod:123456
-------------------------------------
-------------------------------------
-------------------------------------
-------------------------------------
-------------------------------------
-------------------------------------


from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='test') # Buscar usuarios
    print("Usuario encontrado:", user.username)
except User.DoesNotExist:
    print("Error: Usuario no encontrado.")
    user = None



from django.contrib.auth import get_user_model
User = get_user_model()
admin_user = User.objects.create_superuser('admin', 'admin@admin.com', 'admin123')



write to file 
replace file


-----------
Todo web
python manage.py runserver 192.168.100.10:8000
npm run dev -- --host
