const defaults = {
    compareFunction: (a, b) => a - b
}

class PriorityQueue {
    // Representasi data dengan heap
    // contoh fungsi compareFunction:
    //      (a, b) => a - b         berarti PriorityQueue menggunakan max heap 
    //                              dengan priority = value
    //      (a, b) => b - a         berarti PriorityQueue menggunakan min heap 
    //                              dengan priority = value
    //      (a, b) => a[0] - b[0]   berarti PriorityQueue menggunakan max heap 
    //                              dengan priority = value[0] 
    constructor(options = {}) {
        this.heap = options.heap || [];
        this.compareFunction = options.compareFunction || defaults.compareFunction;
    }

    push(element) {
        var index = this.heap.length;
        this.heap.push(element);
        
        while(index) {
            var par = this.#getParent(index);
            if (this.compareFunction(this.heap[index], this.heap[par]) <= 0) break;
            [this.heap[index], this.heap[par]] = [this.heap[par], this.heap[index]];
            index = par;
        }
    }

    top() {
        return this.heap[0];
    }

    pop() {
        [this.heap[0], this.heap[this.heap.length-1]] = 
            [this.heap[this.heap.length-1], this.heap[0]];
        this.heap.pop();
        this.#heapify(0);
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    #getParent(index) {
        return Math.floor((index - 1) / 2);
    }

    #getLeftChild(index) {
        return index * 2 + 1;
    }

    #getRightChild(index) {
        return index * 2 + 2;
    }

    #heapify(index) {
        if (index >= this.heap.length) return;

        var maxIdx = index;
        if (this.#getLeftChild(index) < this.heap.length && 
            this.compareFunction(this.heap[this.#getLeftChild(index)], this.heap[maxIdx]) > 0 ) {
            maxIdx = this.#getLeftChild(index);
        }
        if (this.#getRightChild(index) < this.heap.length && 
            this.compareFunction(this.heap[this.#getRightChild(index)], this.heap[maxIdx]) > 0 ) {
            maxIdx = this.#getRightChild(index);
        }

        [this.heap[index], this.heap[maxIdx]] = [this.heap[maxIdx], this.heap[index]];
        if (maxIdx !== index) {
            this.#heapify(maxIdx);
        }
    }
    
}

export {PriorityQueue};