import { store } from './Store.js';
import { Utils } from './Utils.js';

class NeedleManager {
  constructor(needle) {
    this.needle = needle;
  }

  updatePosition() {
    if (!this.needle) return;
    const offset = 90;
    const windDirectionDeg = store.get('windDirectionDeg');

    if (windDirectionDeg !== undefined) {
      const formatNeedlePosX = Utils.roundNumber(this.needle.rotation.x);
      const formatWindDirectionRad = Utils.roundNumber(
        Utils.convertDegToRad(windDirectionDeg - offset)
      );

      if (formatNeedlePosX !== formatWindDirectionRad) {
        if (formatNeedlePosX < formatWindDirectionRad)
          this.needle.rotation.x += 0.001;
        if (formatNeedlePosX > formatWindDirectionRad)
          this.needle.rotation.x -= 0.001;
      }
    }
  }
}
//   }
// }
export { NeedleManager };
