# Platform

Hoe de mobiele apps van Occa samenhangen met de API en Supabase.

Occa heeft **twee mobiele apps** (shop en shopper) en **drie web-apps** (web, partner en admin). Deze map werkt nu alleen de mobiele apps uit; de web-apps volgen later.

| Bestand                                | Over                                                  |
| -------------------------------------- | ----------------------------------------------------- |
| [00-overzicht.md](00-overzicht.md)     | Het complete plaatje, de leerlus en de uitgangspunten |
| [01-shop-app.md](01-shop-app.md)       | Shop-app: winkels (deze repo)                         |
| [02-shopper-app.md](02-shopper-app.md) | Shopper-app: kopers                                   |
| [03-web-apps.md](03-web-apps.md)       | Web, partner en admin: later uitwerken                |

**Wat de shop-app nu écht aanroept** (toetsbaar, voor andere clients): wiki
[Shop-API](../wiki/shop-api.md). Deze map blijft het ontwerp; de wiki claimt alleen gebouwde
endpoints. Later: live wiki + machineleesbaar contract naast die pagina.

Status: ontwerp, 20 november 2026. De twee apps zijn een **voorstel** dat nog niet in roadmap v0.9 en processen v0.6 staat ("Voorstel: twee mobiele apps voor Occa", ter bespreking met Selim). Verandert het plan, pas dan het bestand van dat product aan en houd het overzicht in lijn.

## Termen

- **Aanvragen**, nooit "reserveren": het systeem zegt "aangevraagd" tot het artikel is klaargelegd (vaste productregel).
- **Modelfoto**: de foto zonder zichtbare paspop (ghost mannequin). Per artikel een keuze, geen standaardstap.
- **Concept**: een artikel dat nog niet online staat.
