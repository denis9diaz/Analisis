import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

def validate_custom_password(password):
    errors = []

    if len(password) < 8:
        errors.append("Debe tener al menos 8 caracteres.")

    if not re.search(r'[A-Z]', password):
        errors.append("Debe contener al menos una letra mayúscula.")

    if not re.search(r'[a-z]', password):
        errors.append("Debe contener al menos una letra minúscula.")

    if not re.search(r'\d', password):
        errors.append("Debe contener al menos un número.")

    if not re.search(r'[^\w\s]', password):
        errors.append("Debe contener al menos un símbolo (ej: @, #, $, %...).")

    if password.isdigit():
        errors.append("No puede ser completamente numérica.")

    if errors:
        raise ValidationError(errors)
