"""Backend coverage for: Transparent risk calculator works.

Verifies POST /api/heatmap/calculate returns a score/tier for a valid payload
(happy path) and rejects a structurally invalid payload (failure case), since
the criterion depends on the calculator's weighted-formula validation.
"""


def test_heatmap_calculate_returns_score_and_tier(client):
    payload = {
        "max_temp": 44,
        "heatwave_days": 16,
        "pop_exposure": 75,
        "urbanization": 78,
        "vegetation_cover": 24,
    }
    resp = client.post("/heatmap/calculate", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "score" in data and isinstance(data["score"], (int, float))
    assert data["tier"] in {"low", "moderate", "high", "very_high"}
    assert "formula" in data and "%" in data["formula"]
    assert "components" in data and isinstance(data["components"], dict)


def test_heatmap_calculate_rejects_invalid_payload(client):
    # Missing all required numeric fields should fail validation, not be silently accepted.
    resp = client.post("/heatmap/calculate", json={"max_temp": "not-a-number"})
    assert resp.status_code in (400, 422), f"expected validation error, got {resp.status_code}: {resp.text}"
