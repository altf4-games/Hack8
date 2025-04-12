using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public enum LiquidType
{
    Copper,
    NitricAcid,
    Iron,
    SilverNitrate,
    Potassium,
    Water,
    SodiumChloride,
    Chlorine
}

public class PickBeaker : MonoBehaviour
{
    [SerializeField]
    public LiquidType liquidType;
    [SerializeField]
    private float pourTime = 1.0f;
    [SerializeField]
    private Material material;
    [SerializeField]
    private GameObject moveToLocation;
    [SerializeField]
    private float defaultFill = 0.2f;

    private Vector3 initalPosition;
    private GameObject beaker;
    private Experiment experiment;

    private void Start()
    {
        beaker = gameObject;
        initalPosition = beaker.transform.position;
        material.SetFloat("_Fill", defaultFill);
        experiment = FindObjectOfType<Experiment>();

        //Set apporpiate liquid colour

        if (liquidType == LiquidType.Copper)
        {
            material.SetColor("_Colour", Color.red);
        }
        else if (liquidType == LiquidType.NitricAcid)
        {
            material.SetColor("_Colour", Color.green);
        }
        else if (liquidType == LiquidType.Iron)
        {
            material.SetColor("_Colour", Color.blue);
        }
        else if (liquidType == LiquidType.SilverNitrate)
        {
            material.SetColor("_Colour", Color.yellow);
        }
        else if (liquidType == LiquidType.Potassium)
        {
            material.SetColor("_Colour", Color.magenta);
        }
        else if (liquidType == LiquidType.Water)
        {
            material.SetColor("_Colour", Color.cyan);
        }
        else if (liquidType == LiquidType.SodiumChloride)
        {
            material.SetColor("_Colour", Color.white);
        }

    }

    private void Update()
    {
        if (Input.GetMouseButtonDown(0) && transform.tag != "Untagged")
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
                            beaker.transform.tag = "Untagged";
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
        float endFill = -0.1f;
        float elapsedTime = 0.0f;
        experiment.LiquidPoured(liquidType);
        while (elapsedTime < pourTime)
        {
            elapsedTime += Time.deltaTime;
            float fill = Mathf.Lerp(startFill, endFill, elapsedTime / pourTime);
            material.SetFloat("_Fill", fill);
            yield return new WaitForSeconds(Time.deltaTime);
        }

        LeanTween.rotate(beaker, new Vector3(0, 0, 0), 1f).setOnComplete(() =>
        {
            LeanTween.move(beaker, initalPosition, 1f);
        });
    }


}
