# Handleiding: GitHub Desktop op een MacBook

Voor wie nog geen Git kent. Met **GitHub Desktop** kun je de Occa-code downloaden,
wijzigingen zien en later weer delen — zonder de Terminal te hoeven gebruiken.

GitHub Desktop installeert automatisch **Git** (het programma achter de schermen).
Je hoeft Git dus niet apart te installeren.

---

## 1. Account

1. Ga naar [github.com](https://github.com) en maak een account (of log in).
2. Vraag iemand van het team of je toegang hebt tot de Occa-repository
   (de map met de code op GitHub).

---

## 2. GitHub Desktop installeren

1. Open [desktop.github.com](https://desktop.github.com).
2. Download **GitHub Desktop for macOS**.
3. Open het gedownloade bestand en sleep **GitHub Desktop** naar **Programma’s**
   (Applications).
4. Start GitHub Desktop vanuit Programma’s.
5. Kies **Sign in to GitHub.com** en log in met je account.
6. Bevestig eventuele vragen van macOS (toegang tot bestanden / sleutelhanger) met
   **OK** of **Toestaan**.

Eerste keer vraagt GitHub Desktop om je **naam** en **e-mail** voor commits
(wijzigingen die je later deelt). Gebruik bij voorkeur hetzelfde e-mailadres als
bij GitHub.

---

## 3. De Occa-map op je Mac zetten (clonen)

1. In GitHub Desktop: **File → Clone repository…**
   (of het scherm *Let’s get started* → **Clone a repository from the Internet**).
2. Tab **GitHub.com**: zoek de Occa-repo, of plak de URL die je van het team kreeg
   (eindigt vaak op `.git`).
3. Bij **Local path**: kies een duidelijke plek, bijvoorbeeld
   `Documenten/Git/occa` of `Developer/occa`.
4. Klik **Clone**. Wacht tot de download klaar is.

Die map is je **lokale project**. Claude Code en Buddy moeten **deze map** openen
(niet een map erboven).

---

## 4. Daarna: Buddy / Claude Code

1. Open Claude Code en selecteer de map die je zojuist hebt geclonet (`occa`).
2. Typ `/buddy` en beschrijf wat je wilt. Zie de [README](../README.md#buddy-claude-code).

Of in Terminal:

```bash
cd /pad/naar/occa
claude
```

---

## 5. Wat je later vaak doet in GitHub Desktop

| Actie | Kort |
| ----- | ---- |
| Wijzigingen zien | Tab **Changes**: welke bestanden je (of Buddy) hebt aangepast |
| Opslaan in Git (commit) | Vul een korte uitleg in, klik **Commit to …** — doe dit alleen als je dat zo wilt |
| Delen met het team (push) | **Push origin** — stuurt jouw commits naar GitHub |
| Nieuwste code ophalen (pull) | **Fetch origin** / **Pull origin** — haalt updates van anderen op |

Twijfel je over commit of push: vraag het team, of laat Buddy eerst alleen de
specificatie maken (**Alleen bewaren**).

---

## Problemen

| Probleem | Wat te doen |
| -------- | ----------- |
| Repo niet zichtbaar bij Clone | Geen toegang: vraag het team om je GitHub-account toe te voegen |
| “Git not found” of installatiefout | Herstart GitHub Desktop; anders opnieuw installeren vanaf desktop.github.com |
| Claude vindt `/buddy` niet | Controleer dat je de map `occa` zelf hebt geopend (de map met `README.md` en `.claude`) |
| Verkeerde map geclonet | In Finder de map zoeken; in Claude Code opnieuw die map kiezen |

Meer over de app zelf installeren: [handleiding-starten.md](handleiding-starten.md).
