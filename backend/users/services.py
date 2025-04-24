from django.contrib.auth.models import Group, Permission

def crear_grupo_administradores():
    """
    Crea el grupo 'Administradores' y asigna permisos para gestionar usuarios.
    """
    administradores, created = Group.objects.get_or_create(name='Administradores')
    # Asignar permisos al grupo Administradores (ejemplo: cambiar usuarios)
    permisos = Permission.objects.filter(codename__startswith='change_user')
    administradores.permissions.set(permisos)


def crear_grupo_clientes():
    """
    Crea el grupo 'Clientes' y asigna permisos para ver canchas y crear reservas.
    """
    clientes, created = Group.objects.get_or_create(name='Clientes')
    # Asignar permisos al grupo Clientes (ejemplo: ver canchas y crear reservas)
    permisos = Permission.objects.filter(codename__in=['view_court', 'add_booking'])
    clientes.permissions.set(permisos)
