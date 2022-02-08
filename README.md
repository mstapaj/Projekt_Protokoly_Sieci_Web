##### English

## Project from the subject "Protokoły Sieci Web"

Project of a website with auctions, chats, comments.

The application uses the components:

1. HTTP
    - CRUD
        - Adding, deleting, editing, reading users
        - Adding, deleting, editing, reading auctions
        - Adding, deleting, editing, reading auction comments
        - Adding, deleting, editing, reading user comments
    - Searching for data by pattern
    - Use of cookies
        - Possibility of remembering the user when logging in
        - Protection against multiple failed login attempts
        - Limitation of the number of possible registrations per hour
2. MQTT

    - Creation, deletion, use of chat rooms
    - Creation, use of private chats between users
    - Adding of "recommend", "not recommend" reactions in users
    - Adding "I like" and "I don't like" comments on auctions
    - Adding reactions "like", "dislike" under comments to users
    - A counter of views of a given auction
    - A counter of users currently watching the given auction
    - Notifications when a given auction is purchased
    - Notification to auction owner on sale
    - Notifications when a new private chat is created
    - Notifications when a user sends a private message

3. Other
    - Use of MongoDB database
    - Automatic saving logs of:
        - Logging in, registration, deleting user, editing user
        - Adding, deleting, editing auctions
        - Add, delete, edit auction comments
        - Add, delete, edit comments to a user
        - Messages in chat rooms
        - Private messages between users
        - The user's purchase of a particular product
    - Creation of chat rooms
    - Use of TLS certificates
    - Encryption of passwords in the database
    - Different user roles:
        - Non-logged-in users
        - Logged in users
        - Administrators
    - Using the MUI library for page styling
    - Protection against brute-force attacks

##### Polski

## Projekt z przedmiotu Protokoły Sieci Web

Projekt strony internetowej z aukcjami, czatami, komentarzami.

Aplikacja korzysta z poszczególnych elementów:

1. HTTP
    - CRUD
        - Dodawanie, usuwanie, edytowanie, odczytywanie użytkowników
        - Dodawanie, usuwanie, edytowanie, odczytywanie aukcji
        - Dodawanie, usuwanie, edytowanie, odczytywanie komentarzy do aukcji
        - Dodawanie, usuwanie, edytowanie, odczytywanie komentarzy do użytkoników
    - Wyszukiwanie danych według wzorca
    - Wykorzystanie ciasteczek
        - Możliwość zapamiętania użytkownika przy zalogowaniu
        - Zabezpieczenie przy wielu nieudanych próbach logowania
        - Ograniczenie ilości możliwych rejestracji na godzinę
2. MQTT

    - Tworzenie, usuwanie, korzystanie z pokojów czatu
    - Tworzenie, korzystanie z czatów prywatnych między użytkownikami
    - Dodawanie reakcji "polecam", "nie polecam" przy użytkownikach
    - Dodawanie reakcji "lubię", "nie lubię" pod komentarzami do aukcji
    - Dodawanie reakcji "lubię", "nie lubię" pod komentarzami do użytkowników
    - Licznik wyświetleń danej aukcji
    - Licznik użytkowników obecnie oglądających daną aukcję
    - Powiadomienia przy zakupie danej aukcji
    - Powiadomienia dla właściciela aukcji przy sprzedaży
    - Powiadomienia przy utworzenie nowego czatu prywatnego
    - Powiadomienia gdy jakiś użytkownik wyśle wiadomość prywatną

3. Inne
    - Wykorzystanie bazy danych MongoDB
    - Automatyczne zapisywanie logów dotyczących:
        - Logowania, rejestracji, usuwania użytkownika, edycji użytkownika
        - Dodawania, usuwania, edycji aukcji
        - Dodawania, usuwania, edycji komentarzy do aukcji
        - Dodawania, usuwania, edycji komentarzy do użytkownika
        - Wiadomości w pokojach czatu
        - Wiadomości prywatnych między użytkownikami
        - Kupowania danego produktu przez użytkownika
    - Możliwość tworzenia pokoi czatów
    - Wykorzystanie certyfikatów TLS
    - Szyfrowanie haseł w bazie danych
    - Różne role użytkowników:
        - Użytkownicy niezalogowani
        - Użytkownicy zalogowani
        - Administratorzy
    - Wykorzystanie bilblioteki MUI przy stylowaniu strony
    - Zabezpieczenie przeciwko atakom brute-force
