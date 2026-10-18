// Controlli automatici sul valutatore usato. Avvio: node tests/valutazione-engine.test.js
"use strict";
const assert = require("assert");
const E = require("../valutazione-engine.js");

const CONDITIONS = ["excellent", "good", "marked", "worn"];
let checks = 0;

for (const [brand, list] of Object.entries(E.priceData)) {
  for (const [model, item] of Object.entries(list)) {
    const storages = Object.keys(item.storage).map(Number).sort((a, b) => a - b);
    const battery = brand === "iphone" ? "iphone_high" : "";

    for (const condition of CONDITIONS) {
      let previous = null;
      for (const storage of storages) {
        const r = E.estimate({ brand, model, storage, account: "yes", condition, displayHistory: "original", battery, tests: {} });
        assert.ok(Number.isFinite(r.cashValue) && r.cashValue >= 0, `${model} ${storage}: valore non valido`);
        assert.ok(r.cashValue <= E.currentRetail(item, storage), `${model} ${storage}: offerta sopra il prezzo di rivendita`);
        if (previous) {
          assert.ok(r.cashValue >= previous.value, `${model} ${condition}: ${storage}GB (${r.cashValue}€) vale meno di ${previous.storage}GB (${previous.value}€)`);
        }
        previous = { storage, value: r.cashValue };
        checks++;
      }
    }

    const base = storages[0];
    const byCondition = CONDITIONS.map((condition) => E.estimate({ brand, model, storage: base, account: "yes", condition, tests: {} }).cashValue);
    for (let i = 1; i < byCondition.length; i++) {
      assert.ok(byCondition[i] <= byCondition[i - 1], `${model}: «${CONDITIONS[i]}» vale più di «${CONDITIONS[i - 1]}»`);
      checks++;
    }

    const blocked = E.estimate({ brand, model, storage: base, account: "no", condition: "good", tests: {} });
    assert.strictEqual(blocked.cashValue, 0, `${model}: account non rimosso deve risultare non acquistabile`);
    checks++;
  }
}

const unknown = E.estimate({ brand: "iphone", model: "Modello inesistente" });
assert.strictEqual(unknown.resultType, "store_only");

console.log(`valutazione-engine: ${checks} controlli superati`);
