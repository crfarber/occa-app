# Shopper-app

Voor kopers: zoeken, struinen, bewaren en aanvragen bij tweedehandswinkels in de buurt. Voorstel: bouwen **na de pilot**; tijdens de pilot bedient web de kopers.

```mermaid
flowchart TB
    subgraph APP["📱 Shopper-app · Expo"]
        B1["Zoeken in gewone taal<br/>en struinen in de regio"]
        B2["Artikel bekijken<br/>modelfoto + originele foto's"]
        B3["Aanvragen"]
        B4["Mijn aanvragen<br/>aangevraagd, klaargelegd, opgehaald"]
        B5["Bewaren en<br/>bewaarde zoekopdrachten"]
        B1 --> B2 --> B3 --> B4
        B2 --> B5
    end

    AUTH["Supabase Auth<br/>inloggen via code"]

    subgraph API["/api/v1/shopper"]
        K1["GET /search"]
        K2["GET /items/:id"]
        K3["POST /requests"]
        K4["GET /requests"]
        K5["/saved"]
    end

    B1 --> K1
    B2 --> K2
    B3 -. "account nodig" .-> AUTH
    B3 --> K3
    B4 --> K4
    B5 --> K5
```

## Uitgangspunten

- Deelt `/api/v1/shopper` met web: dezelfde zoek-, bewaar- en aanvraaglogica.
- **Zoeken en struinen zonder account**; aanvragen en bewaren met account (proces 1.2: aanvragen alleen met een account). Dan moet `/shopper/search` publiek zijn, met rate limiting.
- **Aanvragen, nooit reserveren.** Limieten en termijnen volgen proces 1.2 (voorstel: 10 open per koper, 3 per vestiging, ophalen binnen 3 werkdagen).
- Betalen gebeurt in de winkel, niet via Occa.
- Artikelpagina's tonen naast de modelfoto altijd de originele en detailfoto's, zodat de staat eerlijk zichtbaar is.
- Meldingen in de app; mail, sms of WhatsApp wachten op het domein en een aanbieder.
