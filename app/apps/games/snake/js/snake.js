/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* 
 * DMC adapted jQuery snake game 
 * author: Peter StJ.
 * Used code is from (c) Richard Willis 
 * please see http://code.google.com/p/jquery-snakey/
 * 
 */


// We use jQuery so do not augment the Object
window.remoteEvent = (function () {
	var knownKeys = ['up', 'down', 'left', 'right', 'play'];
	return function(key) {
		if (knownKeys.indexOf(key)!==-1) {
			switch (key) {
				case 'play':
					if (window.gameIsOver) {
						window.gameIsOver = false
						Snake.newGame(true);
					} else {
						Snake.DMCIntegration(key);
					}

					break;
				default: 
					Snake.DMCIntegration(key);
			}
		}
	};
})();
window.onload = function() {
	Snake.setup();
	Snake.newGame();
};
