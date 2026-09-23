# Pyrsonevan.pl — strona serwera Minecraft

## Uruchomienie
Otwórz `index.html` w przeglądarce. Nie potrzebujesz Node.js ani instalowania dodatkowych programów.

## Pliki
- `index.html` — struktura strony
- `style.css` — wygląd, animacje i responsywność
- `script.js` — interakcje

## Co trzeba podłączyć, aby funkcje były prawdziwe?
Obecna wersja jest frontendem/demo. Prawdziwe:
- logowanie i rejestracja Google,
- logowanie Discord,
- konta użytkowników,
- płatności za rangi,
- liczba graczy online i status serwera

wymagają backendu/API oraz konfiguracji OAuth i płatności.

### Discord
W `index.html` znajdź `https://discord.com/` i zamień na zaproszenie do swojego serwera Discord.

### Ceny
Ceny rang są przykładowe. Możesz zmienić je bezpośrednio w `index.html`.

### Statystyki
W `script.js` zmienna `demoPlayers` jest przykładową liczbą. Do prawdziwych danych trzeba podłączyć API serwera Minecraft.
