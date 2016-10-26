export const Nothing = Symbol('Enumerable.Nothing')

export interface EnumerableStatic {
  from<T>(iterable: Iterable<T>)
  range(startIndex: number, count?: number)
}

export class Enumerable<T> {
  static from<T>(iterable: Iterable<T>) {
    return new Enumerable(iterable[Symbol.iterator]())
  }

  static range(startIndex: number, count?: number) {
    if (count === undefined) return Enumerable.range(0, startIndex)

    return new Enumerable(function* () {
      const end = startIndex + count
      for (let idx = startIndex; idx < end; idx++) yield idx
    }())
  }

  constructor(public iterator: Iterator<T>) {}

  filter(predicate: (T) => boolean) {
    return new Enumerable(this.makeIterator(
      x => true,
      x => predicate(x),
      x => x
    ))
  }

  map<R>(selector: (T) => R) {
    return new Enumerable(this.makeIterator(
      x => true,
      x => true,
      x => selector(x)
    ))
  }

  take(count: number) {
    let taken = 0

    return new Enumerable(this.makeIterator(
      x => taken++ < count,
      x => true,
      x => x
    ))
  }

  takeWhile(predicate: (T) => boolean) {
    return new Enumerable(this.makeIterator(
      x => predicate(x),
      x => true,
      x => x
    ))
  }

  skip(count: number) {
    let skipped = 0

    return new Enumerable(this.makeIterator(
      x => true,
      x => skipped++ >= count,
      x => x
    ))
  }

  skipWhile(predicate: (T) => boolean) {
    return new Enumerable(this.makeIterator(
      x => true,
      x =>  !predicate(x),
      x => x
    ))
  }

  count() {
    return this.reduce((a, x) => ++a, 0)
  }

  first() {
    return this.find(x => true)
  }

  find(predicate: (T) => boolean) {
    let result: IteratorResult<T>

    while (!(result = this.iterator.next()).done) {
      if (predicate(result.value)) return result.value
    }
  }

  reduce<A>(expr: (A, T) => A, initial: A) {
    let result: IteratorResult<T>
    let value: A = initial

    while(!(result = this.iterator.next()).done) {
      value = expr(value, result.value)
    }

    return value
  }

  some(predicate: (T) => boolean) {
    let result: IteratorResult<T>

    while (!(result = this.iterator.next()).done) {
      if (predicate(result.value)) return true
    }

    return false
  }

  every(predicate: (T) => boolean) {
    return this.some(x => !predicate(x))
  }

  toArray() {
    const array: Array<T> = []
    let result: IteratorResult<T>

    while (!(result = this.iterator.next()).done) {
      array.push(result.value)
    }

    return array
  }

  private makeIterator<R>(
    next: (T) => boolean,
    apply: (T) => boolean,
    value: (T) => R,
  ) {
    return function* (iterator) {
      let result: IteratorResult<T>

      while (!(result = iterator.next()).done && next(result.value)) {
        if (apply(result.value)) yield value(result.value)
      }
    }(this.iterator)
  }
}
