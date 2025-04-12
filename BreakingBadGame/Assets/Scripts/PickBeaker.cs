using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public enum LiquidType
{
    Hcl,
    Naoh,
    H2o,
    H2so4,
}

public class PickBeaker : MonoBehaviour
{
    [SerializeField]
    private LiquidType liquidType;
    [SerializeField]
    private float pourTime = 1.0f;
    [SerializeField]
    private Material material;
    [SerializeField]
    private GameObject moveToLocation;
    [SerializeField]
    private float defaultFill = 0.2f;

    private GameObject beaker;

    private void Start()
    {
        beaker = gameObject;
        material.SetFloat("_Fill", defaultFill);
    }

    private void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit))
            {
                if (hit.transform == beaker.transform)
                {
                    LeanTween.move(beaker, moveToLocation.transform.position, 1f).setOnComplete(() =>
                    {
                        LeanTween.rotate(beaker, new Vector3(0, 0, -90), 1f).setOnComplete(() =>
                        {
                            // Pour the beaker
                            StartCoroutine(PourBeaker());
                        });
                    });

                }
            }

        }

    }

    private IEnumerator PourBeaker()
    {
        float startFill = material.GetFloat("_Fill");
        float endFill = 0.0f;
        float elapsedTime = 0.0f;
        while (elapsedTime < pourTime)
        {
            elapsedTime += Time.deltaTime;
            float fill = Mathf.Lerp(startFill, endFill, elapsedTime / pourTime);
            material.SetFloat("_Fill", fill);
            yield return new WaitForSeconds(Time.deltaTime);
        }
    }


}
