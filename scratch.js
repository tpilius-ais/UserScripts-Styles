function MeasureElapsedTime()
{
    const start = performance.now();
    // Do the work
    const end = performance.now();
    console.log(`Took ${(end - start).toFixed(3)} ms`);
}
