# Starten 

## 1. Server 
1. In neuem Terminal zu Server Ordner navigieren 
2. `npm i` ausführen
3. `npm run dev` ausführen

## 2. Client 
1. Zu Client Ordner navigieren 
2. `npm i` ausführen
3. `npm run dev` ausführen
4. http://localhost:5173 in Browser öffnen

## 3. Einloggen 
Mit Test Users:
- user1
- user2
- user3

Oder neuen User erstellen. 


# Anforderungen:

- Verschiedene Personen können eine gemeinsame Liste erstellen
  - ANPASSUNG: Eine Liste kann nur von einer Person erstellt werden, aber diese Person kann weitere Personen zur Liste einladen
- Alle Mitglieder der Liste können Aufgaben hinzufügen
- Alle Mitglieder der Liste können Aufgaben anschauen
- Alle Mitglieder der Liste können Aufgaben bearbeiten
  - Einen Locking-Mechanismus
    - Hierfür wird ein Task wird für andere Nutzer gesperrt, wenn jemand bereits im Editor ist. Dies gilt nicht für das Zuweisen von Personen, da diese Änderung automatisch und direkt bei Auswahl eines Nutzers im Dropdown übertragen wird.
- Alle Mitglieder der Liste können Aufgaben abhaken
- Weitere Personen können zu einer bestehenden Liste hinzugefügt werden
  - Erstmal einfach über Benutzernamen
  - CRDT ⇒ eventual consistency ⇒ jede Person einen Add counter und einen Remove counter
    - ANPASSUNG: Es werden keine Add/Remove counter verwendet, da Personen lediglich zur Liste hinzugefügt werden können. Falls sie schon Teil der Liste sind, wird daher nur eine Fehlermeldung angezeigt.

# Details:
- Jede Aufgabe hat einen Titel, ein Fälligkeitsdatum, und optional eine oder mehrere zugewiesene Personen
  - ANPASSUNG: Auch das Fälligkeitsdatum ist optional
- Die Nutzer sollen über eine Webanwendung auf den Task Manager zugreifen können
- React Frontend   
- Express Backend mit Websockets 
- Als besonderes guten Aspekt: UI
  - Dafür wurde eine Keyboard Navigation ermöglicht
